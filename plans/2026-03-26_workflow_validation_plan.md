# 📋 Plan: Workflow Validation & Documentation Update

## 🎯 Objectives
- Validate the `prisma-supabase` hybrid migration workflow.
- Ensure project setup commands (`setup`, `reset:db`, `dev`) are fully operational.
- Document Webhook integration for automated activity logging (Git).
- Provide a Husky pre-commit hook example for the API.
- Update `README.md` with the latest workflow and integration details.

## 🛠️ Proposed Steps

### Phase 1: Environment Validation & Testing
1. **Reset Database**: Run `npm run reset:db` to ensure a clean state and verify the script.
2. **Project Setup**: Run `npm run setup` to verify the full initialization flow.
3. **Run Dev**: Run `npm run dev` to ensure the local Supabase stack and Next.js dev server start correctly.
4. **DB Inspection**: Use `npx prisma db execute --file scripts/check-rls.sql` (if exists) or manual checks to verify RLS and tables.

### Phase 2: Documentation (Webhooks & Husky)
1. **Webhook Documentation**: Document the `/api/integrations/git/commit` endpoint requirements.
2. **Husky Example**: Create a script/template for a Husky hook that sends commits to the Pejotinha API.
3. **Update README**: 
   - Add "Automated Activity Logging" section.
   - Update "Migration Workflow" section to explain the hybrid Prisma + SQL approach.
   - Ensure the "Setup" section is up-to-date with current requirements.

### Phase 3: Final Verification
1. Run `lint` and `build` to ensure no regressions.
2. Verify all documentation links and formatting.
3. Generate the final walkthrough.

## 🧪 Verification Criteria
- `npm run setup` and `reset:db` finish without errors.
- Database contains all expected tables and enums.
- RLS is correctly applied to critical tables (`profiles`, `projects`, `activities`).
- Documentation clearly explains how to use the Git commit webhook.
- README.md provides a clear path for new developers.
