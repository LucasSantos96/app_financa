import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const updated = await prisma.contaMensal.update({
      where: { id },
      data: { status },
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
