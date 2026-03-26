"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Minus } from "lucide-react"
import { formatCurrencyBRL, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency"

interface ReservaActionsProps {
  tipo: "DEPOSITO" | "SAQUE"
  reservaId?: string
  valorAtual: number
  userId: string
}

export function ReservaActions({ tipo, reservaId, valorAtual, userId }: ReservaActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [valor, setValor] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    const valorNum = parseCurrencyInput(valor)
    
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error("Valor inválido")
      return
    }

    if (tipo === "SAQUE" && valorNum > valorAtual) {
      toast.error("Valor maior que a reserva disponível")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          valor: valorNum,
          reservaId,
          userId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao processar")
      }

      toast.success(tipo === "DEPOSITO" ? "Depósito realizado!" : "Saque realizado!")
      setOpen(false)
      setValor("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar")
    } finally {
      setLoading(false)
    }
  }

  const Icon = tipo === "DEPOSITO" ? Plus : Minus
  const label = tipo === "DEPOSITO" ? "Depositar" : "Sacar"
  const colorClass = tipo === "DEPOSITO" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"

  return (
    <>
      <Button 
        className={`${colorClass} w-full`} 
        onClick={() => setOpen(true)}
      >
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label} da Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(formatCurrencyInput(e.target.value))}
                required
              />
            </div>
            {tipo === "SAQUE" && (
              <p className="text-sm text-gray-500">
                Disponível: {formatCurrencyBRL(valorAtual)}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processando..." : label}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
