# Plano de Implementação: Login & Cadastro Automático via Google

## 🎯 Objetivo
Transformar o fluxo de autenticação via Google em uma experiência "zero-friction", garantindo que:
1. O usuário consiga logar com um clique.
2. Se a conta não existir, ela seja criada automaticamente tanto no `auth.users` quanto no `public.profiles`.
3. Se a conta já existir, ela seja vinculada (se for o mesmo email).
4. O design siga o padrão Premium UI do Pejotinha.

## 🛠️ Requisitos Técnicos
- Configuração do Google Cloud Console.
- Configuração do Dashboard do Supabase (Ajuste de Redirect URLs e Provider).
- Sincronização robusta de `Profile` via Database Triggers (Recomendado) ou via Callback Route.

## 📝 Step-by-Step: Configurações de Terceiros e Dashboard

### 1. Google Cloud Console (APIs & Services)
1. Crie um novo projeto no [Google Cloud Console](https://console.cloud.google.com/).
2. Vá em **APIs & Services** > **Credentials**.
3. Clique em **Create Credentials** > **OAuth Client ID**.
4. Selecione **Web Application**.
5. Em **Authorized JavaScript Origins**, adicione:
   - `http://localhost:3000` (Local)
   - `https://[sua-url-de-producao]` (Produção)
6. Em **Authorized Redirect URIs**, adicione a URL que o Supabase fornece (fica no Dashboard do Supabase em Auth > Providers > Google):
   - Exemplo Local Supabase CLI: `http://localhost:54321/auth/v1/callback`
   - Exemplo Supabase Cloud: `https://[seu-ref-id].supabase.co/auth/v1/callback`
7. Salve e copie o **Client ID** e o **Client Secret**.

### 2. Painel do Supabase (Configuração do Provedor)
1. Vá em **Authentication** > **Providers** > **Google**.
2. Cole o **Client ID** e o **Client Secret**.
3. Ative a opção **Skip email confirmation** (fundamental para o fluxo "automático").
4. Ative **Enable Google Provider**.

## 🏗️ Implementação no Código

### Fase 1: Sync de `Profile` (Backend/Triggers)
A melhor forma de garantir que o perfil do usuário seja criado automaticamente é via SQL Trigger no Supabase. Isso evita duplicação e race conditions.

```sql
-- Trigger para criar perfil automaticamente ao logar com Google
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Associar ao evento de INSERT em auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Fase 2: Botão de Login Premium (Frontend)
Refinar o componente `LoginPage` para ter o botão de Google mais proeminente e com feedback visual de carregamento.

### Fase 3: Rota de Callback Robusta
Garantir que o `auth/callback/route.ts` consiga lidar com erros de forma amigável, redirecionando para `/dashboard` se sucesso ou `/login?error=...` se falha.

## ✅ Checklist de Sucesso
- [ ] Login com Google Cria usuário em `auth.users`.
- [ ] Perfil (`public.profiles`) é criado sincronizado.
- [ ] Experiência de clique único (zero preenchimento manual).
- [ ] Re-login com a mesma conta não duplica nada.
