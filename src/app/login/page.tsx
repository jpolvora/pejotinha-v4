"use client"

import { useActionState } from "react"
import { login, loginWithGoogle } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, LayoutDashboard } from "lucide-react"

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

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
        <LayoutDashboard className="h-6 w-6" />
        Pejotinha workspace
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-2 border-border/50 rounded-xl">
        <CardHeader className="space-y-3 pb-6 border-b border-border/50 mb-6 bg-card">
          <CardTitle className="text-3xl font-bold tracking-tight">Access Control</CardTitle>
          <CardDescription className="text-base">
            Sign in to your Pejotinha Workspace account
          </CardDescription>
        </CardHeader>
        
        <form action={formAction}>
          <CardContent className="space-y-5">
            {!state.success && (
              <div className="p-3 mb-4 rounded-md border-l-4 border-destructive bg-destructive/10 text-destructive text-sm font-medium flex gap-2 items-center">
                <AlertCircle className="w-4 h-4" />
                {state.message}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">User Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                autoComplete="email"
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot?</a>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                autoComplete="current-password"
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-between px-6 rounded-md"
            >
              <span>{isPending ? "Authenticating..." : "Authorize Access"}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithGoogle()}
              className="w-full h-12 text-base font-semibold border-2 hover:bg-accent/50 transition-all rounded-md flex items-center justify-center gap-3"
            >
              <GoogleIcon className="h-5 w-5" />
              Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
