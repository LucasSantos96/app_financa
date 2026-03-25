"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface Movimentacao {
  id: string
  descricao: string
  valor: number
  data: Date
  categoria: string
}

interface MovimentacoesListProps {
  tipo: "entrada" | "saida"
  movimentacoes: Movimentacao[]
  userId: string
}

export function MovimentacoesList({ tipo, movimentacoes, userId }: MovimentacoesListProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatDate = (date: Date) => 
    new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
    })

  const excluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return

    try {
      const res = await fetch(`/api/movimentacoes/${tipo}/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Erro ao excluir")

      toast.success("Excluído com sucesso!")
      router.refresh()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  if (movimentacoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <p>Nenhuma {tipo === 'entrada' ? 'entrada' : 'saída'} registrada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {movimentacoes.map(mov => (
        <Card key={mov.id}>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{mov.descricao}</p>
                <p className="text-sm text-gray-500">
                  {mov.categoria} • {formatDate(mov.data)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => excluir(mov.id)}
                  className="h-7 w-7 p-0 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
