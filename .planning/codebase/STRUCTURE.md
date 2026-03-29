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

## Automation & Scripting (`scripts/`)
- `scripts/setup.mjs`: Local environment initialization.
- `scripts/deploy.mjs`: Deployment automation.
- `scripts/check-sanity.mjs`: Connectivity and configuration verification.
