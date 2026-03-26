"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrencyInput, formatNumberToCurrencyInput, parseCurrencyInput } from "@/lib/currency"

interface TransacaoReservaActionsProps {
  transacaoId: string
  valor: number
}

export function TransacaoReservaActions({ transacaoId, valor }: TransacaoReservaActionsProps) {
  const router = useRouter()
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [valorEditado, setValorEditado] = useState(formatNumberToCurrencyInput(valor))
  const [loading, setLoading] = useState(false)

  const handleOpenEdit = (isOpen: boolean) => {
    setOpenEdit(isOpen)
    if (isOpen) {
      setValorEditado(formatNumberToCurrencyInput(valor))
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const valorNum = parseCurrencyInput(valorEditado)

    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      toast.error("Valor inválido")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/reserva/${transacaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao editar")
      }

      toast.success("Transação atualizada")
      setOpenEdit(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao editar")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(`/api/reserva/${transacaoId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao excluir")
      }

      toast.success("Transação removida")
      setOpenDelete(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button type="button" size="icon" variant="ghost" onClick={() => handleOpenEdit(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={() => setOpenDelete(true)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>

      <Dialog open={openEdit} onOpenChange={handleOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar valor da transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor-edicao">Valor</Label>
              <Input
                id="valor-edicao"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={valorEditado}
                onChange={(e) => setValorEditado(formatCurrencyInput(e.target.value))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transação</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Essa ação vai remover a transação e recalcular o valor da reserva.
          </p>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
