# STACK.md - Pejotinha Tech Stack

## Core Technologies
- **Logic**: Next.js 16.2 (App Router & Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **State Management**: React 19 Hooks (Server & Client Components)
- **Styling**: Tailwind CSS v4, Lucide React

## Data & Backend
- **Database**: PostgreSQL (Managed by Supabase)
- **ORM**: Prisma 7.6.0
- **Database Driver**: `pg` (node-postgres)
- **Prisma Adapter**: `@prisma/adapter-pg`
- **Auth**: Supabase SSR / Supabase Auth
- **Client SDK**: `@supabase/supabase-js`, `@supabase/ssr`

## AI Integration
- **Framework**: Vercel AI SDK (`ai` package)
- **Providers**: Anthropic, Google (Gemini), OpenAI

## Infrastructure & Dev Tools
- **Environment**: Docker & Docker Compose (Local Dev)
- **CI/CD Utilities**: ESLint 9, Husky, Lint-Staged, Secretlint
- **Scripts**: Custom Node.js/MJS scripts for setup, link, and deployment.
