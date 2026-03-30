'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  updateProfile, 
  updatePassword, 
  deleteAccount 
} from '@/actions/user'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Trash2, 
  Loader2, 
  Save,
  TriangleAlert,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface ProfileFormProps {
  initialData: {
    email: string
    fullName: string
    provider: string
    role: string
    createdAt: Date
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  
  const [fullName, setFullName] = useState(initialData.fullName)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    try {
      const result = await updateProfile(fullName)
      if (result.success) {
        toast.success(result.data?.message || 'Perfil atualizado!')
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    
    setIsUpdatingPassword(true)
    try {
      const result = await updatePassword(password)
      if (result.success) {
        toast.success(result.data?.message || 'Senha alterada!')
        setPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.error || 'Erro ao trocar senha')
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      toast.error('Erro ao sair')
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'TEM CERTEZA? Esta ação é IRREVERSÍVEL. Todos os seus dados, projetos, clientes e registros de tempo serão excluídos permanentemente.'
    )
    
    if (!confirmation) return

    const secondConfirmation = window.prompt(
      'Para confirmar, digite "EXCLUIR MINHA CONTA" no campo abaixo:'
    )

    if (secondConfirmation !== 'EXCLUIR MINHA CONTA') {
      toast.error('Confirmação inválida. A conta não foi excluída.')
      return
    }

    setIsDeletingAccount(true)
    try {
      await deleteAccount()
    } catch (error) {
      toast.error('Erro ao excluir conta')
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Informações Básicas */}
      <Card className="border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Dados Pessoais</CardTitle>
          </div>
          <CardDescription>
            Informações básicas de identificação na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email (ID de Acesso)
              </Label>
              <Input value={initialData.email} disabled className="bg-muted/40 font-medium" />
              <p className="text-[10px] text-muted-foreground italic">
                O email não pode ser alterado por motivos de segurança.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Provedor de Login
              </Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted/40 font-medium">
                <Badge variant={initialData.provider === 'google' ? 'default' : 'outline'} className="capitalize">
                  {initialData.provider}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Papel (Role)
              </Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted/40 font-medium capitalize">
                {initialData.role}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Membro Desde
              </Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted/40 font-medium">
                {new Date(initialData.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo (Exibição)</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jone Polvora"
                className="max-w-md focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" disabled={isUpdatingProfile} className="gap-2">
              {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trocar Senha (apenas se for email) */}
      {initialData.provider === 'email' && (
        <Card className="border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Trocar Senha</CardTitle>
            </div>
            <CardDescription>
              Mantenha sua conta protegida com uma senha forte.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                />
              </div>
              <Button type="submit" variant="secondary" disabled={isUpdatingPassword} className="gap-2">
                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Atualizar Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Logout e Sair */}
      <Card className="border-border shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            <CardTitle>Sessão</CardTitle>
          </div>
          <CardDescription>
            Encerre sua conexão atual com a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-muted-foreground">
              Deseja sair da sua conta em todos os dispositivos?
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Sair da Conta (Logout)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo / Excluir Conta */}
      <Card className="border-destructive/20 border-2 shadow-lg overflow-hidden bg-destructive/5">
        <CardHeader className="border-b border-destructive/10 bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="h-5 w-5" />
            <CardTitle>Zona de Perigo</CardTitle>
          </div>
          <CardDescription className="text-destructive/80 font-medium">
            Estas ações são permanentes e não podem ser desfeitas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-destructive flex items-center gap-2">
                Excluir permanentemente minha conta
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg">
                Ao excluir sua conta, todos os seus dados pessoais, projetos, clientes, tarefas e registros de atividades serão apagados dos nossos servidores instantaneamente.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="gap-2 font-bold shadow-sm" 
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir Tudo e Sair
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="pb-10 text-center">
        <p className="text-[10px] text-muted-foreground">
          Pejotinha v4 - Proof of Work & Time Tracking Platform
        </p>
      </div>
    </div>
  )
}
