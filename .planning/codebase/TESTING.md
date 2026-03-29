# TESTING.md - Pejotinha Quality Assurance

## Environment Validation
- **`npm run check:all`**: Comprehensive health check including linting, type-checking, and sanity.
- **`scripts/check-sanity.mjs`**: Database connectivity, API availability, and environment variable validation.

## Code Quality
- **TypeScript**: Strict compile-time type checking via `tsc --noEmit`.
- **Linting**: ESLint with custom configurations for Next.js.
- **Security**: Secretlint for credential leakage prevention.

## Data Consistency
- **Prisma Seeding**: Automated data seeding via `npx prisma db seed`.
- **Database Push**: Scripted schema synchronization via `db:push`.
- **Reset Database**: Automated test environment reset including Auth sync and custom SQL setup.

## Testing Pattern
- **GSD Verification**: Use of `/gsd-verify-work` for conversational UAT.
- **Manual QA**: Adherence to the `ux_audit.py` and `accessibility_checker.py` scripts before shipment.
