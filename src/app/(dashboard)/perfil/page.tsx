import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, LogOut } from "lucide-react"
import { LogoutButton } from "./logout-button"

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session) return null

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Perfil</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-lg">{session.user.name || "Usuário"}</p>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <LogoutButton />
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-400 pt-4">
        <p>App Finanças v1.0.0</p>
      </div>
    </div>
  )
}
