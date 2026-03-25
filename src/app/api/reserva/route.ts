import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { tipo, valor, reservaId, userId } = body

    if (!tipo || !valor || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    if (tipo !== "DEPOSITO" && tipo !== "SAQUE") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    let reserva = await prisma.reservaEmergencia.findFirst({
      where: { usuarioId: userId },
    })

    if (!reserva) {
      reserva = await prisma.reservaEmergencia.create({
        data: {
          usuarioId: userId,
          valor: 0,
        },
      })
    }

    if (tipo === "SAQUE" && valor > reserva.valor) {
      return NextResponse.json({ error: "Valor maior que a reserva disponível" }, { status: 400 })
    }

    const novoValor = tipo === "DEPOSITO" 
      ? reserva.valor + valor 
      : reserva.valor - valor

    await prisma.$transaction([
      prisma.reservaEmergencia.update({
        where: { id: reserva.id },
        data: { valor: novoValor },
      }),
      prisma.transacaoReserva.create({
        data: {
          reservaId: reserva.id,
          tipo,
          valor,
        },
      }),
    ])

    if (tipo === "SAQUE") {
      await prisma.entrada.create({
        data: {
          usuarioId: userId,
          descricao: "Saque de reserva de emergência",
          valor,
          categoria: "Reserva Emergência",
        },
      })
    }

    return NextResponse.json({ success: true, novoValor })
  } catch (error) {
    console.error("Erro ao processar reserva:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
