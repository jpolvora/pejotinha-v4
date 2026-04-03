"use client"

import { useActionState, useState } from "react"
import { login, loginWithGoogle, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, LayoutDashboard, User } from "lucide-react"

import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/shared/language-switcher"

const initialState = {
  success: true,
  message: "",
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

interface LoginFormProps {
  isGoogleEnabled: boolean
}

export function LoginForm({ isGoogleEnabled }: LoginFormProps) {
  const t = useTranslations('Auth')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [state, formAction, isPending] = useActionState(
    mode === 'login' ? login : signup, 
    initialState
  )

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    await loginWithGoogle()
    setIsGoogleLoading(false)
  }

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-zinc-950 p-4 relative overflow-hidden font-sans">
      {/* Riskified-style Particle Background */}
      <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.1]" 
        style={{ 
          backgroundImage: `radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* Logo at Top Center (Manual offset to match reference) */}
      <div className="mb-12 flex flex-col items-center gap-2 z-20">
        <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-50 font-black uppercase tracking-[0.4em]">
          <LayoutDashboard className="h-6 w-6 text-primary fill-primary/10" />
          <span className="text-xl">{t('pejotinhaWorkspace') || 'Pejotinha'}</span>
        </div>
      </div>

      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>
      
      <Card className="w-full max-w-[450px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-none ring-0 rounded-sm bg-white dark:bg-zinc-900 relative z-10 p-2 overflow-visible">
        <CardHeader className="space-y-1 pb-10 pt-8 text-center border-none">
          <CardTitle className="text-[26px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {mode === 'login' ? t('accessControl') : t('createAccount')}
          </CardTitle>
          <CardDescription className="hidden">
            {mode === 'login' ? t('signInToWorkspace') : t('joinPejotinha')}
          </CardDescription>
        </CardHeader>
        
        <form action={formAction}>
          <CardContent className="space-y-6">
            {state?.message && (
              <div className={`p-3 mb-6 rounded-md border text-center animate-in fade-in duration-300 ${
                state?.success 
                  ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-900/20 dark:text-green-500' 
                  : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-500'
              }`}>
                <p className="text-xs font-medium">{state?.message}</p>
              </div>
            )}
            
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[13px] font-bold text-zinc-700 dark:text-zinc-400">{t('fullName')}</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  className="h-11 border-zinc-200 dark:border-zinc-700/50 bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all rounded-sm px-4 text-zinc-900 dark:text-zinc-50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-bold text-zinc-700 dark:text-zinc-400">{t('userEmail')}</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Email" 
                required 
                autoComplete="email"
                className="h-11 border-zinc-200 dark:border-zinc-700/50 bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all rounded-sm px-4 text-zinc-900 dark:text-zinc-50"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-bold text-zinc-700 dark:text-zinc-400">{t('password')}</Label>
                {mode === 'login' && (
                  <a href="#" className="text-[11px] font-semibold text-primary/90 hover:text-primary transition-colors">{t('forgot')}</a>
                )}
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Password"
                required 
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                className="h-11 border-zinc-200 dark:border-zinc-700/50 bg-transparent focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all rounded-sm px-4 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-8 pb-4 border-none bg-transparent">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-11 text-sm font-bold bg-[#5856d6] hover:bg-[#4846c4] text-white shadow-none transition-all rounded-sm active:scale-[0.98]"
            >
              {isPending ? t('processing') : (mode === 'login' ? t('authorizeAccess') : t('createAccount'))}
            </Button>

            <button 
              type="button"
              onClick={toggleMode}
              className="text-[13px] text-primary/80 hover:text-primary transition-all font-medium py-1"
            >
              {mode === 'login' 
                ? t('dontHaveAccountSignUp') 
                : t('alreadyHaveAccountSignIn')}
            </button>

            {isGoogleEnabled && (
              <>
                <div className="relative w-full my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.1em]">
                    <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-medium">{t('orContinueWith')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isGoogleLoading || isPending}
                  onClick={handleGoogleLogin}
                  className="w-full h-11 text-[13px] font-bold border-zinc-200 dark:border-zinc-700/50 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all rounded-sm flex items-center justify-center gap-3 text-zinc-900 dark:text-zinc-50"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>{t('connecting')}</span>
                    </div>
                  ) : (
                    <>
                      <GoogleIcon className="h-5 w-5" />
                      <span>{t('signInWithGoogle')}</span>
                    </>
                  )}
                </Button>
              </>
            )}
            
            <div className="mt-16 text-[11px] text-zinc-400 flex gap-4 font-semibold uppercase tracking-wider">
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <span className="ml-auto opacity-50">© PEJOTINHA</span>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Sandbox Access (Matching Reference) */}
      <div className="mt-8 text-center z-20">
        <p className="text-[12px] text-zinc-500 font-medium">
          Don't have an account yet? <a href="#" className="text-primary hover:underline font-bold">Contact us</a>
        </p>
        <p className="mt-2 text-[12px] text-zinc-500 font-medium">
          Sign in to your <a href="#" className="text-primary hover:underline font-bold">Sandbox account</a>
        </p>
      </div>
    </div>
  )
}
