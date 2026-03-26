"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AccountsList } from "./accounts-list"

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

export function AccountsListShell({ contas }: { contas: Conta[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500">Carregando contas...</CardContent>
      </Card>
    )
  }

  return <AccountsList contas={contas} />
}
