import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getStatusByReferenceDate(dataVencimento: number, mes: number, ano: number) {
  const now = new Date()
  const anoAtual = now.getFullYear()
  const mesAtual = now.getMonth() + 1

  if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
    return "ATRASADA" as const
  }

  if (ano === anoAtual && mes === mesAtual && dataVencimento < now.getDate()) {
    return "ATRASADA" as const
  }

  return "PENDENTE" as const
}

function nextMonth(mes: number, ano: number) {
  if (mes === 12) {
    return { mes: 1, ano: ano + 1 }
  }

  return { mes: mes + 1, ano }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    const conta = await prisma.contaMensal.findFirst({
      where: {
        id,
        usuarioId: session.user.id,
      },
    })

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    const statusValido = status === "PENDENTE" || status === "PAGA" || status === "ATRASADA"
    const onlyStatusUpdate = statusValido && Object.keys(body).length === 1

    if (onlyStatusUpdate) {
      const novoStatus = status as "PENDENTE" | "PAGA" | "ATRASADA"

      const updated = await prisma.$transaction(async (tx) => {
        const updatedConta = await tx.contaMensal.update({
          where: { id },
          data: { status: novoStatus },
        })

        const deveCriarProximaParcela =
          novoStatus === "PAGA" &&
          conta.status !== "PAGA" &&
          conta.parcelada &&
          conta.parcelaAtual < conta.totalParcelas

        if (deveCriarProximaParcela) {
          const prox = nextMonth(conta.mes, conta.ano)

          const parcelaJaExiste = await tx.contaMensal.findFirst({
            where: {
              usuarioId: conta.usuarioId,
              nome: conta.nome,
              parcelada: true,
              totalParcelas: conta.totalParcelas,
              parcelaAtual: conta.parcelaAtual + 1,
              mes: prox.mes,
              ano: prox.ano,
            },
          })

          if (!parcelaJaExiste) {
            await tx.contaMensal.create({
              data: {
                nome: conta.nome,
                valor: conta.valor,
                dataVencimento: conta.dataVencimento,
                mes: prox.mes,
                ano: prox.ano,
                status: getStatusByReferenceDate(conta.dataVencimento, prox.mes, prox.ano),
                tipo: conta.tipo,
                fixa: conta.fixa,
                parcelada: true,
                parcelaAtual: conta.parcelaAtual + 1,
                totalParcelas: conta.totalParcelas,
                observacoes: conta.observacoes,
                usuarioId: conta.usuarioId,
              },
            })
          }
        }

        return updatedConta
      })

      return NextResponse.json(updated)
    }

    const dataAtualizacao: {
      nome?: string
      valor?: number
      dataVencimento?: number
      tipo?: "CONTAS_FIXAS" | "CONTAS_VARIAS" | "ASSINATURAS" | "OUTROS"
      fixa?: boolean
      parcelada?: boolean
      parcelaAtual?: number
      totalParcelas?: number
      observacoes?: string | null
      status?: "PENDENTE" | "PAGA" | "ATRASADA"
    } = {}

    if (typeof body.nome === "string" && body.nome.trim()) {
      dataAtualizacao.nome = body.nome.trim()
    }

    if (typeof body.valor === "number" && Number.isFinite(body.valor) && body.valor > 0) {
      dataAtualizacao.valor = body.valor
    }

    if (typeof body.dataVencimento === "number" && body.dataVencimento >= 1 && body.dataVencimento <= 31) {
      dataAtualizacao.dataVencimento = Math.trunc(body.dataVencimento)
    }

    if (["CONTAS_FIXAS", "CONTAS_VARIAS", "ASSINATURAS", "OUTROS"].includes(body.tipo)) {
      dataAtualizacao.tipo = body.tipo
    }

    if (typeof body.fixa === "boolean") {
      dataAtualizacao.fixa = body.fixa
    }

    if (typeof body.parcelada === "boolean") {
      dataAtualizacao.parcelada = body.parcelada
    }

    if (typeof body.parcelaAtual === "number" && body.parcelaAtual >= 1) {
      dataAtualizacao.parcelaAtual = Math.trunc(body.parcelaAtual)
    }

    if (typeof body.totalParcelas === "number" && body.totalParcelas >= 1) {
      dataAtualizacao.totalParcelas = Math.trunc(body.totalParcelas)
    }

    if (typeof body.observacoes === "string") {
      dataAtualizacao.observacoes = body.observacoes.trim() || null
    }

    if (dataAtualizacao.parcelada === false) {
      dataAtualizacao.parcelaAtual = 1
      dataAtualizacao.totalParcelas = 1
    }

    if (conta.status !== "PAGA" && typeof dataAtualizacao.dataVencimento === "number") {
      const now = new Date()
      dataAtualizacao.status = dataAtualizacao.dataVencimento < now.getDate() ? "ATRASADA" : "PENDENTE"
    }

    const updated = await prisma.contaMensal.update({
      where: { id },
      data: dataAtualizacao,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao atualizar conta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const conta = await prisma.contaMensal.findFirst({
      where: {
        id,
        usuarioId: session.user.id,
      },
    })

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    await prisma.contaMensal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir conta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
