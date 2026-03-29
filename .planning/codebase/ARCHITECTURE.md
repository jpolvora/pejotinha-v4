# ARCHITECTURE.md - Pejotinha Architectural Overview

## Full-stack Design
- **Architecture**: Next.js App Router.
- **Data Flow**: Server-first by default. Mutations strictly via Server Actions.
- **Client/Server Boundary**: React Server Components (RSC) by default. Client Components for interactive forms and hooks.

## Multi-tenancy Model
- **Isolation Strategy**: Mandatory `freelancer_id` in every database query and mutation.
- **Authentication**: Row-Level Security (RLS) and Prisma filters in both Server Actions and API Routes.

## Data Layer
- **Schema Management**: Multi-schema approach.
  - `auth`: Managed by Supabase.
  - `public`: Managed by Prisma and Supabase migrations.
- **Database Persistence**: PostgreSQL.

## Security Controls
- Standardized `actionWrapper` for consistent authentication and error handling.
- Sanitization of all user inputs using Zod.
- Data export features via `jspdf`.
