import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Plus, Minus, History } from "lucide-react"
import { ReservaActions } from "./reserva-actions"

export default async function ReservaPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const reserva = await prisma.reservaEmergencia.findFirst({
    where: { usuarioId: session.user.id },
    include: {
      transacoes: {
        orderBy: { data: 'desc' },
        take: 10,
      },
    },
  })

  const valorReserva = reserva?.valor ?? 0

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatDate = (date: Date) => 
    new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 mx-auto text-blue-600" />
        <h1 className="text-xl font-bold">Reserva de Emergência</h1>
        <p className="text-sm text-gray-500">Valore guardado para emergências</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-blue-600 mb-1">Valor Total</p>
          <p className="text-3xl font-bold text-blue-700">{formatCurrency(valorReserva)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <ReservaActions 
          tipo="DEPOSITO" 
          reservaId={reserva?.id} 
          valorAtual={valorReserva}
          userId={session.user.id}
        />
        <ReservaActions 
          tipo="SAQUE" 
          reservaId={reserva?.id} 
          valorAtual={valorReserva}
          userId={session.user.id}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reserva?.transacoes && reserva.transacoes.length > 0 ? (
            <div className="space-y-3">
              {reserva.transacoes.map(transacao => (
                <div key={transacao.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    {transacao.tipo === 'DEPOSITO' ? (
                      <Plus className="h-4 w-4 text-green-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-red-600" />
                    )}
                    <span className="capitalize">{transacao.tipo.toLowerCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className={transacao.tipo === 'DEPOSITO' ? 'text-green-600' : 'text-red-600'}>
                      {transacao.tipo === 'DEPOSITO' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </span>
                    <p className="text-xs text-gray-400">{formatDate(transacao.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma transação ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
