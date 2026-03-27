# Code Review Refinement Plan - 2026-03-27

## Objective
Address critical gaps in Supabase Auth, align with Tailwind CSS v4 directive, and standardize Server Actions for better multi-tenancy and security.

## Findings
1. **Critical**: Missing `middleware.ts` for session refresh.
2. **Discrepancy**: Project uses Tailwind v3, but `AGENTS.md` specifies v4.
3. **Inconsistency**: Some actions use Prisma, some use Supabase client.
4. **UX**: Standardize return types for Server Actions to better handle toasts.

## Plan
1. **Auth & Security**:
   - Create `src/middleware.ts` to handle Supabase SSR session refresh.
   - Refine `src/lib/supabase/server.ts` for robust cookie management.
2. **Styling**:
   - Upgrade to Tailwind CSS v4 (CSS-first config).
   - Remove `tailwind.config.ts`.
3. **Standardization**:
   - Create `src/lib/action-utils.ts` for a unified Server Action wrapper.
   - Refactor `src/actions/customers.ts` to use Prisma and standardized return types.
   - Update `activities.ts` and `expenses.ts` for consistency.
4. **Verification**:
   - Run `npm run check:all`.
   - Manual session testing.
   - Visual check of UI components.
