import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo } = await params
    const body = await req.json()
    const { descricao, valor, categoria, data } = body

    if (!descricao || !valor || !categoria) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const movimentacao = tipo === "entrada"
      ? await prisma.entrada.create({
          data: {
            descricao,
            valor,
            categoria,
            data: new Date(data),
            usuarioId: session.user.id,
          },
        })
      : await prisma.saida.create({
          data: {
            descricao,
            valor,
            categoria,
            data: new Date(data),
            usuarioId: session.user.id,
          },
        })

    return NextResponse.json(movimentacao)
  } catch (error) {
    console.error("Erro ao criar movimentação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
