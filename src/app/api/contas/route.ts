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

function addMonths(mes: number, ano: number, offset: number) {
  const total = (ano * 12 + (mes - 1)) + offset
  return {
    mes: (total % 12) + 1,
    ano: Math.floor(total / 12),
  }
}

function getInitialCompetencia(mes: number, ano: number, dataVencimento: number) {
  const now = new Date()
  const mesAtual = now.getMonth() + 1
  const anoAtual = now.getFullYear()

  const isMesAtual = mes === mesAtual && ano === anoAtual

  if (isMesAtual && dataVencimento < now.getDate()) {
    return addMonths(mes, ano, 1)
  }

  return { mes, ano }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { nome, valor, dataVencimento, mes, ano, tipo, fixa, parcelada, parcelaAtual, totalParcelas, observacoes } = body

    if (!nome || !valor || !dataVencimento || !mes || !ano) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const valorNum = Number(valor)
    const dataVencimentoNum = Number.parseInt(String(dataVencimento), 10)
    const mesNum = Number.parseInt(String(mes), 10)
    const anoNum = Number.parseInt(String(ano), 10)
    const parceladaBool = Boolean(parcelada)
    const fixaBool = Boolean(fixa)
    const parcelaAtualNum = parceladaBool ? Number.parseInt(String(parcelaAtual), 10) || 1 : 1
    const totalParcelasNum = parceladaBool ? Number.parseInt(String(totalParcelas), 10) || 1 : 1

    if (!Number.isFinite(valorNum) || valorNum <= 0 || !Number.isFinite(dataVencimentoNum)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    if (parceladaBool && parcelaAtualNum > totalParcelasNum) {
      return NextResponse.json({ error: "Parcela atual não pode ser maior que o total" }, { status: 400 })
    }

    const competenciaInicial = getInitialCompetencia(mesNum, anoNum, dataVencimentoNum)

    if (parceladaBool) {
      const contasCriadas = []

      for (let parcela = parcelaAtualNum; parcela <= totalParcelasNum; parcela += 1) {
        const offset = parcela - parcelaAtualNum
        const competencia = addMonths(competenciaInicial.mes, competenciaInicial.ano, offset)

        const contaCriada = await prisma.contaMensal.create({
          data: {
            nome,
            valor: valorNum,
            dataVencimento: dataVencimentoNum,
            mes: competencia.mes,
            ano: competencia.ano,
            status: getStatusByReferenceDate(dataVencimentoNum, competencia.mes, competencia.ano),
            tipo: tipo || "OUTROS",
            fixa: fixaBool,
            parcelada: true,
            parcelaAtual: parcela,
            totalParcelas: totalParcelasNum,
            observacoes: observacoes || null,
            usuarioId: session.user.id,
          },
        })

        contasCriadas.push(contaCriada)
      }

      return NextResponse.json(contasCriadas[0])
    }

    const conta = await prisma.contaMensal.create({
      data: {
        nome,
        valor: valorNum,
        dataVencimento: dataVencimentoNum,
        mes: competenciaInicial.mes,
        ano: competenciaInicial.ano,
        status: getStatusByReferenceDate(dataVencimentoNum, competenciaInicial.mes, competenciaInicial.ano),
        tipo: tipo || "OUTROS",
        fixa: fixaBool,
        parcelada: false,
        parcelaAtual: 1,
        totalParcelas: 1,
        observacoes: observacoes || null,
        usuarioId: session.user.id,
      },
    })

    return NextResponse.json(conta)
  } catch (error) {
    console.error("Erro ao criar conta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
