# Plano de Implementação: Signup no Login Form (2026-03-26)

Integração da funcionalidade de cadastro dentro do formulário de login existente, permitindo que novos usuários se registrem como `freelancers` por padrão, com a possibilidade de serem convidados como `clients` posteriormente.

## 📋 Requisitos e Objetivos
1.  **UI/UX**: Alternância suave entre "Login" e "Cadastro" no mesmo Card de acesso via `useState`.
2.  **Campos de Cadastro**: E-mail, Senha e Nome Completo (Full Name).
3.  **Integração de Dados**: Sincronização automática entre Supabase Auth e Tabela `profiles` via Trigger DB existente (`handle_new_user`).
4.  **Papel Padrão**: Todo novo usuário começa como `freelancer`.
5.  **Confirmação de E-mail**: Lidar com o estado de sucesso do Supabase Auth exibindo mensagem amigável caso confirmação seja necessária.

## 🛠️ Arquitetura e Componentes
- **Localização**: `src/app/login/`
- **UI Components**: `lucide-react`, `shadcn/ui` (Button, Input, Card, Label).
- **Lógica**: `useActionState` para lidar com as Server Actions.
- **Backend**: Server Actions em `actions.ts`.

## 🏗️ Passo a Passo

### 1. Atualização das Server Actions (`src/app/login/actions.ts`)
- Implementar a função `signup` que utiliza `supabase.auth.signUp`.
- Passar `full_name` nos metadados do usuário (`options.data: { full_name }`).
- Retornar mensagem de sucesso pedindo verificação de e-mail se aplicável.

### 2. Atualização da Interface (`src/app/login/page.tsx`)
- Adicionar estado local `mode` ('login' | 'signup') via `useState`.
- Adicionar campo condicional `fullName` para o modo cadastro.
- Ajustar os textos (CardTitle, CardDescription, ButtonText) dinamicamente.
- Implementar o botão de alternância "Don't have an account? Sign up" e "Already have an account? Sign in".
- Ajustar `formAction` dinamicamente conforme o `mode`.

### 3. Ajuste de Estilo e Animações
- Garantir transições limpas.
- Manter o design premium (glassmorphism/vibrant vibes).

## ✅ Critérios de Aceitação
- [ ] Usuário consegue alternar entre Login e Cadastro.
- [ ] Cadastro cria usuário no Supabase Auth com `full_name` nos metadados.
- [ ] Trigger do BD cria perfil correspondente na tabela `profiles`.
- [ ] Mensagem de sucesso exibida após cadastro.
- [ ] Redirecionamento correto pós-login.

## 🗂️ Referências
- `prisma/schema.prisma` -> Model `Profile` (default role: freelancer).
- `prisma/migrations/.../migration.sql` -> Trigger `handle_new_user`.
