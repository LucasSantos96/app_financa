"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(ano, mes - 1, 1))
  const [displayedMonth, setDisplayedMonth] = useState(new Date(ano, mes - 1, 1))

  const abrirFiltro = () => {
    const referencia = new Date(ano, mes - 1, 1)
    setSelectedDate(referencia)
    setDisplayedMonth(referencia)
    setOpen(true)
  }

  const aplicarFiltro = () => {
    const mesSelecionado = displayedMonth.getMonth() + 1
    const anoSelecionado = displayedMonth.getFullYear()
    const params = new URLSearchParams(searchParams.toString())

    params.set("mes", String(mesSelecionado))
    params.set("ano", String(anoSelecionado))

    router.replace(`${pathname}?${params.toString()}`)
    router.refresh()
    setOpen(false)
  }

  const limparFiltro = () => {
    const now = new Date()
    const dataAtual = new Date(now.getFullYear(), now.getMonth(), 1)
    setSelectedDate(dataAtual)
    setDisplayedMonth(dataAtual)
    router.replace(pathname)
    router.refresh()
    setOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    if (date) {
      setDisplayedMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }

  const handleMonthChange = (month: Date) => {
    const referencia = new Date(month.getFullYear(), month.getMonth(), 1)
    setDisplayedMonth(referencia)

    if (!selectedDate) {
      setSelectedDate(referencia)
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={abrirFiltro}>
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
                month={displayedMonth}
                onMonthChange={handleMonthChange}
                captionLayout="dropdown"
                selected={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={limparFiltro}>
                Mês atual
              </Button>
              <Button type="button" className="flex-1" onClick={aplicarFiltro}>
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
