import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import { AccountsListShell } from "./accounts-list-shell"
import { ContasFilter } from "./contas-filter"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default async function ContasPage({
  searchParams,
}: {
  searchParams?: Promise<{ mes?: string; ano?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const now = new Date()
  const mesAtual = now.getMonth() + 1
  const anoAtual = now.getFullYear()

  const params = searchParams ? await searchParams : {}

  const mesSelecionado = Number.parseInt(params?.mes || "", 10)
  const anoSelecionado = Number.parseInt(params?.ano || "", 10)

  const mes = Number.isFinite(mesSelecionado) && mesSelecionado >= 1 && mesSelecionado <= 12
    ? mesSelecionado
    : mesAtual

  const ano = Number.isFinite(anoSelecionado) && anoSelecionado >= 2000
    ? anoSelecionado
    : anoAtual

  const contas = await prisma.contaMensal.findMany({
    where: {
      usuarioId: session.user.id,
      mes,
      ano,
    },
    orderBy: [{ ano: 'asc' }, { mes: 'asc' }, { dataVencimento: 'asc' }],
  })

  const contasAPagar = contas.filter((c: { status: string }) => c.status !== 'PAGA')
  const contasPendentes = contas.filter((c: { status: string }) => c.status === 'PENDENTE')
  const contasAtrasadas = contas.filter((c: { status: string }) => c.status === 'ATRASADA')

  const totalContasDoMes = contasAPagar.reduce((acc: number, c: { valor: number }) => acc + c.valor, 0)
  const totalPendentes = contasPendentes.reduce((acc: number, c: { valor: number }) => acc + c.valor, 0)
  const totalAtrasadas = contasAtrasadas.reduce((acc: number, c: { valor: number }) => acc + c.valor, 0)

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Contas do Mês</h1>
        <Button size="sm">
          <Link href="/contas/nova" className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500">Referência selecionada</p>
            <p className="text-sm font-medium">{MESES[mes - 1]} de {ano}</p>
          </div>
          <ContasFilter mes={mes} ano={ano} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
            <p className="text-xs text-yellow-600">Contas do Mês</p>
            <p className="text-sm font-bold text-yellow-700">{formatCurrency(totalContasDoMes)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <p className="text-xs text-red-600">Pendentes</p>
            <p className="text-sm font-bold text-red-700">{formatCurrency(totalPendentes + totalAtrasadas)}</p>
          </CardContent>
        </Card>
      </div>

      <AccountsListShell 
        contas={contas}
      />
    </div>
  )
}
