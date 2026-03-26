import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ transacaoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { transacaoId } = await params
    const { valor } = await req.json()

    if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }

    const transacao = await prisma.transacaoReserva.findUnique({
      where: { id: transacaoId },
      include: { reserva: true },
    })

    if (!transacao || transacao.reserva.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    const sinal = transacao.tipo === "DEPOSITO" ? 1 : -1
    const novoValorReserva = transacao.reserva.valor + sinal * (valor - transacao.valor)

    if (novoValorReserva < 0) {
      return NextResponse.json({ error: "Valor maior que a reserva disponível" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.transacaoReserva.update({
        where: { id: transacaoId },
        data: { valor },
      }),
      prisma.reservaEmergencia.update({
        where: { id: transacao.reservaId },
        data: { valor: novoValorReserva },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao editar transação da reserva:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ transacaoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { transacaoId } = await params

    const transacao = await prisma.transacaoReserva.findUnique({
      where: { id: transacaoId },
      include: { reserva: true },
    })

    if (!transacao || transacao.reserva.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    const novoValorReserva = transacao.tipo === "DEPOSITO"
      ? transacao.reserva.valor - transacao.valor
      : transacao.reserva.valor + transacao.valor

    if (novoValorReserva < 0) {
      return NextResponse.json({ error: "Operação inválida" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.transacaoReserva.delete({
        where: { id: transacaoId },
      }),
      prisma.reservaEmergencia.update({
        where: { id: transacao.reservaId },
        data: { valor: novoValorReserva },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir transação da reserva:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
