"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Trash2, Edit, History } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Conta {
  id: string
  nome: string
  valor: number
  dataVencimento: number
  mes: number
  ano: number
  status: string
  tipo: string
  fixa: boolean
  parcelada: boolean
  parcelaAtual: number
  totalParcelas: number
  observacoes: string | null
}

interface AccountsListProps {
  contas: Conta[]
}

function compareByDueDate(a: Conta, b: Conta) {
  if (a.ano !== b.ano) return a.ano - b.ano
  if (a.mes !== b.mes) return a.mes - b.mes
  return a.dataVencimento - b.dataVencimento
}

function compareContasAPagar(a: Conta, b: Conta) {
  if (a.status === "ATRASADA" && b.status !== "ATRASADA") return -1
  if (a.status !== "ATRASADA" && b.status === "ATRASADA") return 1
  return compareByDueDate(a, b)
}

export function AccountsList({ contas }: AccountsListProps) {
  const router = useRouter()
  const [contaParaPagar, setContaParaPagar] = useState<Conta | null>(null)
  const [registrarSaida, setRegistrarSaida] = useState(false)
  const [loadingPagamento, setLoadingPagamento] = useState(false)

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatCompetencia = (mes: number, ano: number) =>
    `${String(mes).padStart(2, "0")}/${ano}`

  const abrirModalPagamento = (conta: Conta) => {
    setContaParaPagar(conta)
    setRegistrarSaida(false)
  }

  const marcarComoPaga = async () => {
    if (!contaParaPagar || loadingPagamento) return

    setLoadingPagamento(true)

    try {
      const res = await fetch(`/api/contas/${contaParaPagar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGA", registrarSaida }),
      })

      if (!res.ok) throw new Error("Erro ao marcar como paga")

      toast.success("Conta marcada como paga!")
      setContaParaPagar(null)
      router.refresh()
    } catch {
      toast.error("Erro ao marcar como paga")
    } finally {
      setLoadingPagamento(false)
    }
  }

  const excluirConta = async (contaId: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return

    try {
      const res = await fetch(`/api/contas/${contaId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Erro ao excluir")

      toast.success("Conta excluída!")
      router.refresh()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  if (contas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma conta este mês</p>
          <Link href="/contas/nova" className="text-blue-600 hover:underline mt-2 inline-block">
            Adicionar conta
          </Link>
        </CardContent>
      </Card>
    )
  }

  const contasAPagar = contas
    .filter((c) => c.status !== "PAGA")
    .sort(compareContasAPagar)

  const contasPagas = contas
    .filter((c) => c.status === "PAGA")
    .sort((a, b) => compareByDueDate(b, a))

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Contas a pagar</p>
      {contasAPagar.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Todas as contas foram pagas!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-flow-col auto-cols-[88%] gap-3 overflow-x-scroll overscroll-x-contain pb-2 snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch]">
          {contasAPagar.map((conta) => (
            <Card
              key={conta.id}
              className={`min-w-0 snap-start ${conta.status === "ATRASADA" ? "border-red-300 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{conta.nome}</span>
                      {conta.fixa && <Badge variant="secondary" className="text-xs">Fixa</Badge>}
                      {conta.parcelada && (
                        <Badge variant="outline" className="text-xs">
                          {conta.parcelaAtual}/{conta.totalParcelas}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Venc: {String(conta.dataVencimento).padStart(2, "0")}/{String(conta.mes).padStart(2, "0")}</p>
                    <p className="text-xs text-gray-400">Competência {formatCompetencia(conta.mes, conta.ano)}</p>
                    {conta.observacoes && <p className="text-xs text-gray-400 mt-1">{conta.observacoes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(conta.valor)}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirModalPagamento(conta)}
                        className="h-7 w-7 p-0 text-green-600"
                        title="Marcar como paga"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Link
                        href={`/contas/${conta.id}/editar`}
                        className="h-7 w-7 p-0 inline-flex items-center justify-center hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirConta(conta.id)}
                        className="h-7 w-7 p-0 text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-3">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </p>
          {contasPagas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">Nenhuma conta paga ainda</p>
          ) : (
            <div className="space-y-3">
              {contasPagas.map((conta) => (
                <div key={conta.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{conta.nome}</span>
                      {conta.parcelada && (
                        <Badge variant="outline" className="text-xs">
                          {conta.parcelaAtual}/{conta.totalParcelas}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Competência {formatCompetencia(conta.mes, conta.ano)}</p>
                  </div>
                  <span className="text-green-600">{formatCurrency(conta.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(contaParaPagar)}
        onOpenChange={(open) => {
          if (!open && !loadingPagamento) {
            setContaParaPagar(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar conta como paga</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Essa conta deve ser registrada como saída do saldo atual?
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={registrarSaida}
              onChange={(e) => setRegistrarSaida(e.target.checked)}
              disabled={loadingPagamento}
            />
            Sim, subtrair do saldo atual
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setContaParaPagar(null)}
              disabled={loadingPagamento}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={marcarComoPaga}
              disabled={loadingPagamento}
            >
              {loadingPagamento && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loadingPagamento ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  )
}
