"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrencyInput, formatNumberToCurrencyInput, parseCurrencyInput } from "@/lib/currency"

interface EditContaFormProps {
  conta: {
    id: string
    nome: string
    valor: number
    dataVencimento: number
    tipo: string
    fixa: boolean
    parcelada: boolean
    parcelaAtual: number
    totalParcelas: number
    observacoes: string | null
  }
}

export function EditContaForm({ conta }: EditContaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: conta.nome,
    valor: formatNumberToCurrencyInput(conta.valor),
    dataVencimento: String(conta.dataVencimento),
    tipo: conta.tipo,
    fixa: conta.fixa ? "true" : "false",
    parcelada: conta.parcelada ? "true" : "false",
    parcelaAtual: String(conta.parcelaAtual),
    totalParcelas: String(conta.totalParcelas),
    observacoes: conta.observacoes ?? "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const valorNumerico = parseCurrencyInput(form.valor)

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      toast.error("Informe um valor válido")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/contas/${conta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          valor: valorNumerico,
          dataVencimento: Number.parseInt(form.dataVencimento, 10),
          tipo: form.tipo,
          fixa: form.fixa === "true",
          parcelada: form.parcelada === "true",
          parcelaAtual: Number.parseInt(form.parcelaAtual, 10),
          totalParcelas: Number.parseInt(form.totalParcelas, 10),
          observacoes: form.observacoes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao editar")
      }

      toast.success("Conta atualizada com sucesso!")
      router.push("/contas")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao editar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Editar Conta</h1>

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
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
