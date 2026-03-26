# 📋 Pejotinha - Especificações e Roadmap (Master Source of Truth)

Este documento é a Referência Mestra para o projeto Pejotinha. Ele deve ser atualizado sempre que uma nova feature for implementada ou o escopo mudar.

---

## 🎯 Visão Geral
O Pejotinha é um SaaS multiusuário para freelancers que vai além do simples tracking de tempo. Ele foca em **Proof of Work (PoW)**, integrando registros de atividades com evidências reais (prints, commits, logs) e IA para automação de registros.

---

## 🛠️ Stack Tecnológica
- **Framework:** Next.js (App Router)
- **Estilização:** Tailwind CSS + Lucide React
- **Banco de Dados:** PostgreSQL via Prisma ORM
- **Storage/Auth:** Supabase
- **IA:** Vercel AI SDK (OpenAI/Google Gemini)
- **Infra:** Docker & Docker Compose (Multi-stage: Dev/Prod)
- **Deployment:** Self-hosted Supabase Architecture (CLI-driven)

---

## ✅ Funcionalidades Implementadas

### 1. Núcleo SaaS & Infraestrutura
- [x] **Multi-tenancy:** Isolamento completo de dados por `freelancer_id` (vinculado ao `User` do Supabase).
- [x] **Self-hosted Supabase:** Stack completa local (Auth, DB, Storage, Studio) via CLI.
- [x] **Docker Moderno:** Imagens multi-stage com Next.js standalone mode.
- [x] **Vibe Coding History:** Integração do `VibeCoderLogger` para rastreio de planos e walkthroughs em `/plans`.
- [x] **Gestão de Clientes:** CRUD completo de Clientes (`Customer`).
- [x] **Gestão de Projetos:** Cadastro de Projetos com `hourly_rate`, `tech_stacks` e **Auto-Slug Generation**.
- [x] **Autenticação:** Integração com Supabase (Google OAuth e Email/Senha c/ **Signup unificado**).
- [x] **Segurança:** Criptografia AES-256-GCM para dados sensíveis via `ENCRYPTION_SECRET`.

### 2. Registro de Atividades (Proof of Work)
- [x] **Log de Atividades:** Registro com descrição, duração, data/hora e metatags (`sprint`, `ticket`).
- [x] **Gestão de Evidências:** Upload de arquivos e links para comprovação de trabalho.
- [x] **IA "Magic" Log:** Extração de payload estruturado a partir de texto natural.
- [x] **Valor Automático:** Cálculo do valor da atividade com base no `hourly_rate` do projeto.

### 3. Produtividade & Finanças
- [x] **Gestão de Tarefas (Tasks):** CRUD de tarefas com status (pending, doing, done).
- [x] **Controle de Despesas:** Registro de gastos vinculados a projetos ou ao freelancer.
- [x] **Agenda Pessoal:** Registro de eventos privados para garantir transparência.
- [x] **Faturamento (Invoicing):** Geração básica de faturas (rascunho, enviada, paga).

### 4. Integrações & Ajustes
- [x] **Telegram Integration:** Configuração de bot token para comandos remotos.
- [x] **Dashboard:** Resumo de horas, faturamento e atividades recentes.
- [x] **Reporting & Advanced Intelligence:** Relatórios detalhados com IA Summarization.
- [x] **Client Portal (Hierarchical Access):** Sistema de convites com papéis granularizados (**Owner** e **Supervisor**) via `ProjectAccess`.

---

## 🚀 Funcionalidades a Implementar (Backlog Prioritário)

### 1. Refinamento de UX & Automação (Fase Atual)
- [x] **Cálculo de Tempo Real:** Atualizar `durationMinutes` automaticamente vindo do `startTime/endTime`.
- [x] **Slug Automático:** Projetos geram slugs amigáveis em tempo real na criação.
- [x] **Timeline Visual:** Componente unificado de atividades e eventos pessoais no Dashboard.
- [x] **Sistema de Toasts Premium:** Padronizar feedbacks visuais com Toasts customizados.

### 2. Expansão de Features
- [x] **Relatórios Avançados:** Filtros dinâmicos por período, cliente e projeto com gráficos de produtividade.
- [x] **Proofs UI Pro:** Galeria de evidências melhorada, com preview de imagens e links diretos para commits/documentos.
- [x] **Exportação PDF/Excel:** Para relatórios de atividades via Print/PDF.
- [x] **Client Invites:** Sistema de convites por e-mail e aceitação via token.

---

## 🗂️ Arquitetura de Dados (Prisma)
- `Profile`: Extensão do User (auth), guarda configurações e preferências.
- `Customer`: Cliente do freelancer.
- `Project`: Projeto vinculado ao cliente. Guarda `hourly_rate`.
- `Activity`: O centro do sistema. Registra tempo e descrição. Vinculado a `Project` e opcionalmente `Task`.
- `Evidence`: Arquivos/Links vinculados a uma `Activity`.
- `Task`: Tarefas do projeto.
- `Expense`: Custos operacionais.
- `PersonalEvent`: Tempo não produtivo (mas rastreado).
- `Invoice`: Cobrança gerada a partir das atividades.

---

## 📜 Regras de Ouro para IAs
1. **Isolamento de Dados (RLS):** Toda query Prisma ou SQL deve incluir o filtro de `freelancer_id` vindo da sessão.
2. **Server Actions:** Toda alteração de dado deve ser via Action em `/actions`.
3. **TypeScript:** Tipagem estrita é obrigatória. Não use `any`.
4. **UX Premium:** Use cores harmoniosas, micro-animações e estados de loading (`useFormStatus`, `Suspense`).
5. **Clean Code:** Se a lógica ficar complexa, extraia para `/lib` ou `/hooks`.
