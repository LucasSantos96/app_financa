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
    const { nome, valor, dataVencimento, mes, ano, tipo, fixa, parcelada, parcelaAtual, totalParcelas, observacoes } = body

    if (!nome || !valor || !dataVencimento || !mes || !ano) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const now = new Date()
    const status = dataVencimento < now.getDate() ? "ATRASADA" : "PENDENTE"

    const conta = await prisma.contaMensal.create({
      data: {
        nome,
        valor: parseFloat(valor),
        dataVencimento: parseInt(dataVencimento),
        mes: parseInt(mes),
        ano: parseInt(ano),
        status,
        tipo: tipo || "OUTROS",
        fixa: fixa || false,
        parcelada: parcelada || false,
        parcelaAtual: parcelada ? parseInt(parcelaAtual) || 1 : 1,
        totalParcelas: parcelada ? parseInt(totalParcelas) || 1 : 1,
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
