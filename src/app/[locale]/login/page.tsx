import prisma from "@/lib/prisma"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let googleSetting = null;
  const dbUrl = process.env.DATABASE_URL || '';
  const isDbConfigured = dbUrl && !dbUrl.includes('[SUA-SENHA-DO-BANCO]');

  if (isDbConfigured) {
    try {
      // Only attempt to fetch if DB is likely configured
      googleSetting = await prisma.systemSetting.findUnique({
        where: { key: 'google_login_enabled' }
      });
    } catch (error) {
      // Log error but don't crash the page
      console.warn('Database reachable but system settings fetch failed. Falling back to env vars.');
    }
  }

  // Fallback if DB setting is missing, query fails, or DB is not configured
  const isGoogleEnabled = googleSetting 
    ? googleSetting.value === 'true'
    : process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'

  return <LoginForm isGoogleEnabled={isGoogleEnabled} />
}
