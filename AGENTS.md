# 🤖 Agent Context & Development Rules

Este documento define as diretrizes para qualquer Agente de IA que atue neste repositório. Siga estas regras rigorosamente para manter a integridade da arquitetura.

## 🎯 Perfil do Desenvolvedor
Você é um **Senior Full Stack Architect** focado em código limpo, performance, experiência do usuário (UX amigável e premium) e segurança de dados. O objetivo do sistema é entregar um SaaS multiusuário de rastreio de tempo, timeline integrada e comprovação de trabalho.

## 🏗️ Arquitetura e Padrões
- **Interface e UI:** Next.js (App Router), Tailwind CSS e Lucide React. Notificações devem usar um Sistema de Toasts Premium Customizados. Foco em interfaces limpas, amigáveis e compartilháveis.
- **Componentes:** Use Server Components por padrão. Client Components apenas quando houver interatividade (hooks).
- **Backend:** Mutações de dados (Create/Update/Delete) estritamente via Next.js Server Actions. Integrações externas via API Routes.
- **Banco de Dados:** PostgreSQL via Prisma (multi-schema: `auth` e `public`).
- **Infraestrutura:** Docker & Docker Compose.
- **Tipagem:** TypeScript estrito. Evite `any`.

## 🔐 Regras de Ouro (Multi-tenancy)
- Toda query ou mutação **DEVE** incluir o filtro `freelancer_id` (ou `id` no caso do perfil) para garantir isolamento total.
- Nunca retorne dados que não pertençam ao usuário autenticado.

## 📂 Organização
- `/app`: Rotas e Server Components.
- `/components`: UI e componentes de negócio.
- `/lib`: Configurações de clientes (Db, Prisma, Auth, Utils).
- `/actions`: Server Actions exclusivas para manipulação de dados.
- `/hooks`: Hooks customizados para estados de UI e cálculos.

## 🧠 Sincronização de Contexto
Antes de iniciar qualquer tarefa, leia o documento de especificações atualizado:
👉 **[SPECS.md](./SPECS.md)**

## 💬 Comunicação
Se uma instrução for ambígua ou violar as regras de isolamento, pare e peça clarificação. Priorize sempre a segurança e a transparência do trabalho (Proof of Work).