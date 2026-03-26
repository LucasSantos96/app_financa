import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BalanceHeader } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const entradas = await prisma.entrada.findMany({
    where: {
      usuarioId: session.user.id,
    },
  })

  const saidas = await prisma.saida.findMany({
    where: {
      usuarioId: session.user.id,
    },
  })

  const contasMensais = await prisma.contaMensal.findMany({
    where: {
      usuarioId: session.user.id,
      mes,
      ano,
    },
  })

  const totalEntradas = entradas.reduce((acc: number, e: { valor: number }) => acc + e.valor, 0)
  const totalSaidas = saidas.reduce((acc: number, s: { valor: number }) => acc + s.valor, 0)
  const saldo = totalEntradas - totalSaidas

  const reserva = await prisma.reservaEmergencia.findFirst({
    where: { usuarioId: session.user.id },
  })

  const reservaValor = reserva?.valor ?? 0

  return (
    <div className="min-h-screen pb-20">
      <BalanceHeader saldo={saldo} reserva={reservaValor} />
      <main className="max-w-md mx-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  )
}
