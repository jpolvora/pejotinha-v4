# STRUCTURE.md - Pejotinha Directory Layout

## Source Code (`src/`)
- `src/actions/`: Server Actions for database mutations.
- `src/app/`: Next.js routes, page layouts, and folder-based routing.
- `src/components/`: Reusable React components (UI and domain-specific).
- `src/hooks/`: Custom state and inter-component logic.
- `src/lib/`: Backend and client configurations (Prisma, Supabase, utility functions).

## Database (`prisma/` & `supabase/`)
- `prisma/schema.prisma`: Schema and seed data.
- `supabase/`: Database migrations, seed scripts, and configuration for local/cloud.

## Documentation & Planning
- `docs/`: Product design and project documentation.
- `plans/`: Recorded planning and development history.
- `.planning/`: Active GSD planning and codebase map.

## Configuration & Root Files
- `prisma.config.ts`: Centralized Prisma 7 configuration (schema path, migrations, seed, and adapter settings).
- `package.json`: Dependency management and npm scripts.
- `next.config.js`: Next.js configuration.
- `.env`: Environment variables (local dev).
- `.env.cloud`: Environment variables (cloud dev).
