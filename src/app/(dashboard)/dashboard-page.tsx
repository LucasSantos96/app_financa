"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  AlertCircle,
  PiggyBank,
  Target
} from "lucide-react"
import Link from "next/link"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

interface Entrada {
  id: string
  descricao: string
  valor: number
  data: Date
  categoria: string
}

interface Saida {
  id: string
  descricao: string
  valor: number
  data: Date
  categoria: string
}

interface ContaMensal {
  id: string
  nome: string
  valor: number
  dataVencimento: number
  mes: number
  ano: number
  status: string
}

interface DashboardProps {
  entradas: Entrada[]
  saidas: Saida[]
  contas: ContaMensal[]
  reserva: number
  userName: string | null
  mes: number
  ano: number
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export default function DashboardPage({ 
  entradas: initialEntradas, 
  saidas: initialSaidas, 
  contas: initialContas,
  reserva,
  userName,
  mes,
  ano
}: DashboardProps) {
  const [periodo, setPeriodo] = useState<"7" | "15" | "30" | "custom">("30")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const periodoDias = periodo === "7" ? 7 : periodo === "15" ? 15 : periodo === "30" ? 30 : 0

  const { entradas, saidas, entradasPorCategoria, saidasPorCategoria, periodoLabel } = useMemo(() => {
    if (!initialEntradas || !initialSaidas) {
      return {
        entradas: [],
        saidas: [],
        entradasPorCategoria: [],
        saidasPorCategoria: [],
        periodoLabel: ""
      }
    }

    let entradasFiltradas = [...initialEntradas]
    let saidasFiltradas = [...initialSaidas]

    let periodoLabel = ""
    
    if (periodo === "custom" && dataInicio && dataFim) {
      const dataInicioDate = new Date(dataInicio)
      const dataFimDate = new Date(dataFim)
      entradasFiltradas = entradasFiltradas.filter(e => {
        const data = new Date(e.data)
        return data >= dataInicioDate && data <= dataFimDate
      })
      saidasFiltradas = saidasFiltradas.filter(s => {
        const data = new Date(s.data)
        return data >= dataInicioDate && data <= dataFimDate
      })
      periodoLabel = `${dataInicio} - ${dataFim}`
    } else {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - periodoDias)
      entradasFiltradas = entradasFiltradas.filter(e => new Date(e.data) >= dataLimite)
      saidasFiltradas = saidasFiltradas.filter(s => new Date(s.data) >= dataLimite)
      periodoLabel = `Últimos ${periodoDias} dias`
    }

    const entradasAgrupadas = entradasFiltradas.reduce((acc, e) => {
      acc[e.categoria] = (acc[e.categoria] || 0) + e.valor
      return acc
    }, {} as Record<string, number>)

    const saidasAgrupadas = saidasFiltradas.reduce((acc, s) => {
      acc[s.categoria] = (acc[s.categoria] || 0) + s.valor
      return acc
    }, {} as Record<string, number>)

    const entradasPorCategoria = Object.entries(entradasAgrupadas)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const saidasPorCategoria = Object.entries(saidasAgrupadas)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return {
      entradas: entradasFiltradas,
      saidas: saidasFiltradas,
      entradasPorCategoria,
      saidasPorCategoria,
      periodoLabel
    }
  }, [initialEntradas, initialSaidas, periodo, dataInicio, dataFim, periodoDias])

  const totalEntradas = entradas.reduce((acc, e) => acc + e.valor, 0)
  const totalSaidas = saidas.reduce((acc, s) => acc + s.valor, 0)
  const saldo = totalEntradas - totalSaidas

  const taxaPoupanca = totalEntradas > 0 ? ((totalEntradas - totalSaidas) / totalEntradas * 100) : 0
  const saudeFinanceira = taxaPoupanca >= 20 ? "Ótima" : taxaPoupanca >= 10 ? "Boa" : taxaPoupanca >= 0 ? "Atenção" : "Crítica"

  const contasPendentes = (initialContas || []).filter(c => c.status === 'PENDENTE')
  const contasAtrasadas = (initialContas || []).filter(c => c.status === 'ATRASADA')
  const totalContasPendentes = contasPendentes.reduce((acc, c) => acc + c.valor, 0)

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const mesNome = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Olá, {userName || 'Usuário'}!</h1>
        <p className="text-sm text-gray-500 capitalize">{mesNome} de {ano}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            Saúde Financeira
            <span className={`text-xs px-2 py-1 rounded ${
              saudeFinanceira === "Ótima" ? "bg-green-100 text-green-700" :
              saudeFinanceira === "Boa" ? "bg-blue-100 text-blue-700" :
              saudeFinanceira === "Atenção" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {saudeFinanceira}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {(["7", "15", "30"] as const).map((p) => (
              <Button
                key={p}
                variant={periodo === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodo(p)}
              >
                {p}d
              </Button>
            ))}
            <Button
              variant={periodo === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodo("custom")}
            >
              Personalizado
            </Button>
          </div>

          {periodo === "custom" && (
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label className="text-xs">De</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Até</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mb-4">{periodoLabel}</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <ArrowUpCircle className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-green-600">Entradas</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <ArrowDownCircle className="h-4 w-4 mx-auto text-red-600 mb-1" />
              <p className="text-xs text-red-600">Saídas</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-4 w-4 mx-auto text-blue-600 mb-1" />
              <p className="text-xs text-blue-600">Saldo</p>
              <p className={`text-sm font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                Taxa de Poupança
              </span>
              <span className={`font-bold ${taxaPoupanca >= 20 ? 'text-green-600' : taxaPoupanca >= 10 ? 'text-blue-600' : taxaPoupanca >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {taxaPoupanca.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${taxaPoupanca >= 20 ? 'bg-green-500' : taxaPoupanca >= 10 ? 'bg-blue-500' : taxaPoupanca >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.max(taxaPoupanca, 0), 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-500">Reserva</span>
            </div>
            <p className="text-sm font-bold text-blue-600">{formatCurrency(reserva)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-gray-500">Contas Pendentes</span>
            </div>
            <p className="text-sm font-bold text-yellow-600">{formatCurrency(totalContasPendentes)}</p>
          </CardContent>
        </Card>
      </div>

      {saidasPorCategoria.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={saidasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {saidasPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {saidasPorCategoria.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entradasPorCategoria.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entradasPorCategoria.slice(0, 5)} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {contasAtrasadas.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              Contas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contasAtrasadas.map(conta => (
                <div key={conta.id} className="flex justify-between text-sm">
                  <span>{conta.nome}</span>
                  <span className="font-medium text-red-600">{formatCurrency(conta.valor)}</span>
                </div>
              ))}
            </div>
            <Link href="/contas" className="text-xs text-red-600 mt-2 block hover:underline">
              Ver todas →
            </Link>
          </CardContent>
        </Card>
      )}

      {contasPendentes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Próximas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contasPendentes.slice(0, 5).map(conta => (
                <div key={conta.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{conta.nome}</span>
                  <span className="font-medium">{formatCurrency(conta.valor)}</span>
                </div>
              ))}
            </div>
            <Link href="/contas" className="text-xs text-blue-600 mt-2 block hover:underline">
              Ver todas →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
