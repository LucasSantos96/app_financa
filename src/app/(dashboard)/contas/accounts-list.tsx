"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
  mes: number
  ano: number
  userId: string
}

export function AccountsList({ contas, mes, ano, userId }: AccountsListProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const marcarComoPaga = async (contaId: string) => {
    try {
      const res = await fetch(`/api/contas/${contaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAGA" }),
      })

      if (!res.ok) throw new Error("Erro ao marcar como paga")

      toast.success("Conta marcada como paga!")
      router.refresh()
    } catch {
      toast.error("Erro ao marcar como paga")
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

  const contasVisiveis = contas.filter(c => c.status !== 'PAGA')

  if (contasVisiveis.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>Todas as contas foram pagas!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {contasVisiveis.map(conta => (
        <Card key={conta.id} className={`
          ${conta.status === 'ATRASADA' ? 'border-red-300 bg-red-50' : ''}
          ${conta.status === 'PENDENTE' ? 'border-yellow-200 bg-yellow-50' : ''}
        `}>
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
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
                <p className="text-sm text-gray-500">
                  Venc: {conta.dataVencimento}/{conta.mes}
                </p>
                {conta.observacoes && (
                  <p className="text-xs text-gray-400 mt-1">{conta.observacoes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(conta.valor)}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => marcarComoPaga(conta.id)}
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
