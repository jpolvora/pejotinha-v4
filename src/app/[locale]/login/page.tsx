import prisma from "@/lib/prisma"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  // Fetch system configuration
  const googleSetting = await prisma.systemSetting.findUnique({
    where: { key: 'google_login_enabled' }
  })

  // Fallback to environment variable if DB setting is missing
  const isGoogleEnabled = googleSetting 
    ? googleSetting.value === 'true'
    : process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'

  return <LoginForm isGoogleEnabled={isGoogleEnabled} />
}
