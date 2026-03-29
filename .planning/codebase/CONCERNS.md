# CONCERNS.md - Pejotinha Technical Concerns & Debt

## Data Security & Isolation
- **Multi-tenancy Leakage**: High priority concern. Every new query or action must strictly enforce `freelancer_id` isolation.
- **RLS/Prisma Sync**: Ensuring Row-Level Security matches Prisma-side filters.

## Migration & Deployment
- **Schema Management**: Handling discrepancies between Prisma schema and Supabase migrations.
- **Environment Handling**: Correct switching between `.env` (local) and `.env.cloud`.

## Architectural Stability
- **Server Action Refactoring**: Maintaining standard `actionWrapper` across all actions (legacy actions may still require refactoring).
- **Prisma Decimal Serialization**: Handling Decimal type conversion for Client Components to prevent client-side crashes.

## Performance & UX
- **Page Load Optimization**: Ensuring Next.js 16 features like Turbopack are utilized effectively.
- **Accessibility**: Continuous monitoring of UI against accessibility standards.
- **Toasts Consistency**: Uniform usage of premium toasts across the application.
