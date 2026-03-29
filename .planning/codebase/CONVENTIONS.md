# CONVENTIONS.md - Pejotinha Development Standards

## Coding Principles
- **Clean Code**: Adhere to the `clean-code` skill. Proactive, minimal comments, and self-documenting code.
- **Strict Typing**: No `any` types. Full TypeScript integration for all components and utilities.

## UI/UX Standards
- **Aesthetic Excellence**: Premium design, vibrant color palettes, and glassmorphism.
- **Dynamic Interaction**: Smooth transitions, hover effects, and micro-animations.
- **Toasts**: Standardized Custom Premium Toasts for feedback.

## Data Isolation
- **Multi-tenancy**: Mandatory inclusion of `freelancer_id` in all data interactions.
- **Isolation Enforcement**: Queries and mutations without explicit identity filtering are prohibited.

## Workflow Patterns
- **Server Actions**: All mutations must go through standardized server actions (`actionWrapper`).
- **Prisma + Supabase**: Hybrid migration and sync via Prisma and Supabase tools.
