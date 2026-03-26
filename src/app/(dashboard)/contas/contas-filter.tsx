"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ContasFilterProps {
  mes: number
  ano: number
}

export function ContasFilter({ mes, ano }: ContasFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(ano, mes - 1, 1))

  const aplicarFiltro = () => {
    if (!selectedDate) return

    const mesSelecionado = selectedDate.getMonth() + 1
    const anoSelecionado = selectedDate.getFullYear()

    router.push(`${pathname}?mes=${mesSelecionado}&ano=${anoSelecionado}`)
    setOpen(false)
  }

  const limparFiltro = () => {
    const now = new Date()
    const dataAtual = new Date(now.getFullYear(), now.getMonth(), 1)
    setSelectedDate(dataAtual)
    router.push(pathname)
    setOpen(false)
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Filter className="mr-2 h-4 w-4" />
        Filtrar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar mês de contas</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Selecione qualquer data no mês desejado
            </p>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={limparFiltro}>
                Mês atual
              </Button>
              <Button type="button" className="flex-1" onClick={aplicarFiltro} disabled={!selectedDate}>
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
