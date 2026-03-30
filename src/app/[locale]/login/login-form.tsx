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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Premium background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
        <LayoutDashboard className="h-6 w-6" />
        Pejotinha workspace
      </div>

      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border border-white/10 rounded-2xl bg-background/50 backdrop-blur-xl relative z-10 transition-all hover:shadow-primary/5">
        <CardHeader className="space-y-3 pb-6 border-b border-white/5 mb-6">
          <CardTitle className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            {mode === 'login' ? t('accessControl') : t('createAccount')}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            {mode === 'login' 
              ? t('signInToWorkspace') 
              : t('joinPejotinha')}
          </CardDescription>
        </CardHeader>
        
        <form action={formAction}>
          <CardContent className="space-y-6">
            {state?.message && (
              <div className={`p-4 mb-4 rounded-xl border-l-4 flex gap-3 items-center animate-in zoom-in-95 duration-300 ${
                state?.success 
                  ? 'border-primary bg-primary/10 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                  : 'border-destructive bg-destructive/10 text-destructive-foreground'
              }`}>
                {state?.success ? <LayoutDashboard className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <p className="text-sm font-semibold">{state?.message}</p>
              </div>
            )}
            
            {mode === 'signup' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{t('fullName')}</Label>
                <div className="relative group">
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-xl pl-11 backdrop-blur-sm"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">{t('userEmail')}</Label>
              <div className="relative group">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  autoComplete="email"
                  className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-xl pl-11 backdrop-blur-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors font-bold text-lg">@</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{t('password')}</Label>
                {mode === 'login' && (
                  <a href="#" className="text-xs font-bold text-primary/80 hover:text-primary transition-colors">{t('forgot')}</a>
                )}
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                className="h-12 border-white/10 bg-white/5 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all rounded-xl backdrop-blur-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 pt-4 pb-8">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-12 text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-between px-6 rounded-xl group"
            >
              <span className="tracking-tight">{isPending ? t('processing') : (mode === 'login' ? t('authorizeAccess') : t('createAccount'))}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <button 
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-primary transition-all font-bold tracking-tight py-1"
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
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                    <span className="bg-[#121212] px-3 text-muted-foreground/50 font-black">{t('orContinueWith')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isGoogleLoading || isPending}
                  onClick={handleGoogleLogin}
                  className="w-full h-12 text-sm font-black border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl flex items-center justify-center gap-3 relative overflow-hidden group backdrop-blur-sm"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="tracking-widest">{t('connecting')}</span>
                    </div>
                  ) : (
                    <>
                      <GoogleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="tracking-widest uppercase">{t('signInWithGoogle')}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
