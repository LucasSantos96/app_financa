import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Link from "next/link"
import { MovimentacoesList } from "./movimentacoes-list"

export default async function MovimentacoesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const entradas = await prisma.entrada.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { data: 'desc' },
  })

  const saidas = await prisma.saida.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { data: 'desc' },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Movimentações</h1>
      </div>

      <Tabs defaultValue="entradas" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="entradas" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
            Entradas
          </TabsTrigger>
          <TabsTrigger value="saidas" className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
            Saídas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entradas" className="mt-4 space-y-3">
          <Button className="w-full" variant="outline">
            <Link href="/movimentacoes/nova?tipo=entrada" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrada
            </Link>
          </Button>
          <MovimentacoesList 
            tipo="entrada" 
            movimentacoes={entradas} 
            userId={session.user.id}
          />
        </TabsContent>

        <TabsContent value="saidas" className="mt-4 space-y-3">
          <Button className="w-full" variant="outline">
            <Link href="/movimentacoes/nova?tipo=saida" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nova Saída
            </Link>
          </Button>
          <MovimentacoesList 
            tipo="saida" 
            movimentacoes={saidas} 
            userId={session.user.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
