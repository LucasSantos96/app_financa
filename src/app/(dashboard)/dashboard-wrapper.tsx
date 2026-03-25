import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardPage from "./dashboard-page"

export default async function DashboardWrapper() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const contas = await prisma.contaMensal.findMany({
    where: {
      usuarioId: session.user.id,
      mes,
      ano,
    },
    orderBy: { dataVencimento: 'asc' }
  })

  const entradas = await prisma.entrada.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { data: 'desc' }
  })

  const saidas = await prisma.saida.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { data: 'desc' }
  })

  const reserva = await prisma.reservaEmergencia.findFirst({
    where: { usuarioId: session.user.id },
  })

  return (
    <DashboardPage
      entradas={entradas}
      saidas={saidas}
      contas={contas}
      reserva={reserva?.valor ?? 0}
      userName={session.user.name || null}
      mes={mes}
      ano={ano}
    />
  )
}
