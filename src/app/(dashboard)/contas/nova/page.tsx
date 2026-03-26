"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency"
import { Loader2 } from "lucide-react"

export default function NovaContaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<{
    nome: string
    valor: string
    dataVencimento: string
    tipo: string
    fixa: string
    parcelada: string
    parcelaAtual: string
    totalParcelas: string
    observacoes: string
  }>({
    nome: "",
    valor: "",
    dataVencimento: "",
    tipo: "OUTROS",
    fixa: "false",
    parcelada: "false",
    parcelaAtual: "1",
    totalParcelas: "1",
    observacoes: "",
  })

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const valorNumerico = parseCurrencyInput(form.valor)

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor válido")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          valor: valorNumerico,
          mes,
          ano,
          fixa: form.fixa === "true",
          parcelada: form.parcelada === "true",
          parcelaAtual: parseInt(form.parcelaAtual),
          totalParcelas: parseInt(form.totalParcelas),
        }),
      })

      if (!res.ok) throw new Error("Erro ao criar")

      toast.success("Conta criada com sucesso!")
      router.push("/contas")
      router.refresh()
    } catch {
      toast.error("Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nova Conta</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Ex: Conta de Luz"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: formatCurrencyInput(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Dia de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={form.tipo} 
                onValueChange={(value) => setForm({ ...form, tipo: value || "OUTROS" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTAS_FIXAS">Conta Fixa</SelectItem>
                  <SelectItem value="CONTAS_VARIAS">Conta Variada</SelectItem>
                  <SelectItem value="ASSINATURAS">Assinatura</SelectItem>
                  <SelectItem value="OUTROS">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.fixa === "true"}
                    onChange={(e) => setForm({ ...form, fixa: e.target.checked ? "true" : "false" })}
                  />
                  <span className="text-sm">Conta Fixa</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.parcelada === "true"}
                    onChange={(e) => setForm({ ...form, parcelada: e.target.checked ? "true" : "false" })}
                  />
                  <span className="text-sm">Parcelada</span>
                </label>
              </div>
            </div>

            {form.parcelada === "true" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelaAtual">Parcela Atual</Label>
                  <Input
                    id="parcelaAtual"
                    type="number"
                    min="1"
                    value={form.parcelaAtual}
                    onChange={(e) => setForm({ ...form, parcelaAtual: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalParcelas">Total Parcelas</Label>
                  <Input
                    id="totalParcelas"
                    type="number"
                    min="1"
                    value={form.totalParcelas}
                    onChange={(e) => setForm({ ...form, totalParcelas: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Opcional"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
