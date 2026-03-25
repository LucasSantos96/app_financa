"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair da conta
    </Button>
  )
}
