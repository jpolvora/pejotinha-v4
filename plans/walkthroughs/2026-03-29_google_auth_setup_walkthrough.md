# Walkthrough: Configuração Dinâmica de Google Auth via Setup

## 🚀 O que mudou?
Elevamos a integração do Google Auth para um nível profissional, adicionando controle total via script de setup e persistência em banco de dados.

### 1. Novo Passo de Setup
- Modificado: `scripts/setup.mjs`
- Adicionado o diálogo de configuração: **Habilitar** ou **Desabilitar** Google Login.
- Se habilitado, o script solicita `Client ID` e `Secret` e os salva automaticamente no `.env` correto (Local ou Cloud).
- Adicionada a flag `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` para controle imediato da UI.

### 2. Persistência de Configuração Global
- Modificado: `prisma/schema.prisma`
- Adicionada a tabela `system_settings` para armazenar configurações dinâmicas que podem ser alteradas sem redeploy.
- Modificado: `prisma/seed.ts`
- O banco agora é "semeado" com a escolha feita durante o setup, garantindo consistência entre o `.env` e o banco de dados.

### 3. UI Inteligente (Conditional Login)
- Modificado: `src/app/login/page.tsx` (Refatorado para Server Component)
- Novo Componente: `src/app/login/login-form.tsx` (Client Component)
- A tela de login agora consulta o banco de dados (Source of Truth) para decidir se exibe ou oculta o botão do Google. Se desabilitado, o botão desaparece completamente, mantendo a interface limpa.

### 4. Suporte Total para Dev Local
- Modificado: `supabase/config.toml`
- Adicionado o provider Google na configuração local do Supabase CLI.
- Agora, ao rodar `supabase start`, o ambiente local já aceita as credenciais do Google injetadas pelo script de setup.

---

## 🛠️ Como Testar Agora
1. Execute o comando de setup:
   ```bash
   npm run setup
   ```
2. Ao chegar no passo de **Google Auth**, escolha **1 (Habilitar)** e insira suas credenciais.
3. Inicie o projeto e vá para a tela de login.
4. O botão do Google estará visível e funcional!

Se desejar desabilitar depois, basta rodar o `setup` novamente e escolher **2 (Desabilitar)**.

---
*Implementado por Antigravity (Senior Architect)*
