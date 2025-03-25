import { signOut } from "@/auth"
import { LogOut } from "lucide-react"
import { Button } from "./ui/button"

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button size="icon" type="submit"><LogOut /></Button>
    </form>
  )
}