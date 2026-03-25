import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo, id } = await params

    if (tipo === "entrada") {
      const entrada = await prisma.entrada.findFirst({
        where: { id, usuarioId: session.user.id },
      })

      if (!entrada) {
        return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 })
      }

      await prisma.entrada.delete({ where: { id } })
    } else if (tipo === "saida") {
      const saida = await prisma.saida.findFirst({
        where: { id, usuarioId: session.user.id },
      })

      if (!saida) {
        return NextResponse.json({ error: "Saída não encontrada" }, { status: 404 })
      }

      await prisma.saida.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir movimentação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
