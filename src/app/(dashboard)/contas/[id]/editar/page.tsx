import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditContaForm } from "./edit-conta-form"

export default async function EditarContaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const { id } = await params

  const conta = await prisma.contaMensal.findFirst({
    where: {
      id,
      usuarioId: session.user.id,
    },
  })

  if (!conta) {
    notFound()
  }

  return (
    <EditContaForm
      conta={{
        id: conta.id,
        nome: conta.nome,
        valor: conta.valor,
        dataVencimento: conta.dataVencimento,
        tipo: conta.tipo,
        fixa: conta.fixa,
        parcelada: conta.parcelada,
        parcelaAtual: conta.parcelaAtual,
        totalParcelas: conta.totalParcelas,
        observacoes: conta.observacoes,
      }}
    />
  )
}
