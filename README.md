# 🚀 Pejotinha v4 - Freelancer Dashboard & Proof of Work

Pejotinha é uma plataforma SaaS multiusuário voltada para freelancers que desejam profissionalizar sua gestão de tempo, gastos e comprovação de trabalho. Focado em **Experiência do Usuário Premium** e **Segurança**, o sistema oferece uma timeline integrada de atividades, gestão de clientes e ferramentas de IA para automação de logs.

---

## ✨ Funcionalidades em Destaque

- **Signup & Auth**: Fluxo de cadastro integrado com Supabase Auth e sincronização automática de perfis.
- **Hierarchical Access**: Gestão de acessos granular para projetos (Owner vs Supervisor).
- **Proof of Work (PoW)**: Registro de atividades com evidências, prints e logs integrados.
- **IA Assisted Logging**: Use linguagem natural para registrar suas horas.
- **Timeline Integrada**: Visualize eventos pessoais e profissionais em uma linha do tempo unificada.
- **Slug System**: Geração automática de URLs amigáveis para projetos.
- **Vibe Coding History**: Histórico detalhado de todo o desenvolvimento em `/plans`.

---

## 🛠️ Tecnologias
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide React, Shadcn/UI.
- **Backend / BaaS**: Supabase (Self-hosted ou Cloud) - Auth, Storage, Edge Functions.
- **ORM**: Prisma (PostgreSQL).
- **IA**: Vercel AI SDK (Google Gemini / OpenAI).
- **Infra**: Docker Multi-stage (Development & Runner).

---

## 🏗️ Arquitetura Self-Hosted
Este projeto foi desenhado para ser totalmente independente. Diferente de outros SaaS que exigem contas pagas em serviços de nuvem, o Pejotinha permite que você rode **sua própria stack do Supabase** localmente ou em seu servidor através do **Supabase CLI**.

---

## 🚀 Como Começar (Setup Rápido)

### 📋 Pré-requisitos
Para rodar este projeto localmente, você precisará de:

- **Git**: Para clonar o repositório.
- **Terminal**: Utilizar Bash ou CMD (Git Bash é altamente recomendado no Windows).
- **Docker / Docker Desktop**: Para rodar o container do Supabase e o banco de dados.
- **Node.js**: Versão 20 ou superior.
- **NPM**: Gerenciador de pacotes (instalado com o Node).

---

### 🛠️ Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/jpolvora/pejotinha-v4.git
   cd pejotinha-v4
   ```

2. **Execute o Setup Automatizado**:
   ```bash
   npm run setup
   ```
   *Este comando configura o .env, sobe o Supabase local, sincroniza o banco e as permissões de acesso.*

3. **Inicie o Ambiente de Desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Verificação de Sanidade (Opcional)**:
   *Garante que Lint, Tipos e Conexão com o Banco/Supabase estão OK.*
   ```bash
   npm run check:all
   ```

---

## 🔄 Workflow de Migrações (Hybrid Approach)

O Pejotinha utiliza um workflow híbrido entre **Prisma** e **Supabase SQL** para garantir que recursos nativos (RLS, Triggers) sejam mantidos.

1. **Alterar Schema**: Modifique `prisma/schema.prisma`.
2. **Sincronizar**: 
   - Desenvolvimento: `npx prisma db push`
   - Produção: `npx prisma migrate dev`
3. **Aplicar Supabase Rules**: Sempre após uma sincronização que altere tabelas, execute:
   ```bash
   npm run db:setup-supabase
   ```
   *Isso re-aplica as políticas de RLS e Triggers definidos em `scripts/setup-supabase.sql`.*

---

## 🔌 Integrações e Automação (Webhooks)

O Pejotinha permite automatizar o registro de atividades através de Webhooks.

- **Git Commit Workflow**: Registre automaticamente seus commits como atividades vinculadas a projetos.
- **Husky Integration**: Automatize o envio de commits usando hooks de git locais.

Confira a [documentação de integrações](./docs/INTEGRATIONS.md) para saber como configurar.

---

## 📸 Screenshots

### Dashboard Desktop
![Dashboard](public/screenshots/dashboard.png)

### Access Control (SignUp/Login)
![Login](public/screenshots/login.png)

### Project Management
![Projects](public/screenshots/projects.png)

---

4. **Pare o Ambiente Local**:
   ```bash
   npm run stop
   ```

5. **Acesse as ferramentas**:
   - **Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Supabase Studio (Painel Admin)**: [http://localhost:54323](http://localhost:54323)
   - **Mailpit (Inbucket)**: [http://localhost:54324](http://localhost:54324)

---

## 🔑 Acesso Padrão (Seed)
Após o setup, o banco de dados virá populado com os seguintes dados de teste:

- **Admin**: `admin@email.com` / `P@ssword!`
- **Freelancer Teste**: `freelancer@pejotinha.dev` / `P@ssword!`

---

## 📦 Deploy em Produção
Para faturar a imagem otimizada para o seu servidor:

1. **Execute o Deploy**:
   ```bash
   npm run deploy
   ```
   *Isso irá construir o container em modo standalone e subir para o GHCR.*

---

## 🛡️ Segurança e Desenvolvimento (CI/CD Local)
Este projeto utiliza **Husky**, **Lint-Staged** e **Secretlint** para garantir a qualidade e segurança do código.
- **Pré-commit**: Toda tentativa de commit irá rodar uma verificação de segurança automática para impedir que credenciais (API Keys, Secrets) sejam vazadas no repositório.

---

## 🔐 Segurança e Criptografia
Para proteger as credenciais de integração dos usuários (Tokens de Telegram, API Keys), o Pejotinha utiliza criptografia **AES-256-GCM**.
- O segredo de criptografia é gerado automaticamente no arquivo `.env` durante o setup (`ENCRYPTION_SECRET`).
- **IMPORTANTE**: Nunca perca este segredo em produção, ou os dados criptografados serão ilegíveis.

---

## 🤝 Contribuição
1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
2. Commit suas mudanças (`git commit -m 'Add nova feature'`).
3. Push para a branch (`git push origin feature/nova-feature`).
4. Abra um Pull Request.

---

## 📄 Licença
Desenvolvido por **Jone Polvora**. Este projeto é focado em produtividade para a comunidade freelancer.