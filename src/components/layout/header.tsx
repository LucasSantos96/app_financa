"use client"

import { useState } from "react"
import { Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  saldo: number
  reserva: number
}

export function BalanceHeader({ saldo, reserva }: HeaderProps) {
  const [showBalance, setShowBalance] = useState(true)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Saldo Atual</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 p-0"
          >
            {showBalance ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span
            className={`text-2xl font-bold ${
              saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {showBalance ? formatCurrency(saldo) : "••••••"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4 text-blue-600" />
          <span>Reserva:</span>
          <span className="font-medium">
            {showBalance ? formatCurrency(reserva) : "••••••"}
          </span>
        </div>
      </div>
    </div>
  )
}
