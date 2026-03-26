# Implementation Plan: Pejotinha v4 Feature Alignment

This plan addresses the gaps between the current project state and the requirements defined in [CLAUDE.md](file:///l:/source/pejotinha-v4/CLAUDE.md), focusing on automation, integrations, and enhanced AI-driven reporting.

## User Review Required

> [!IMPORTANT]
> **Database Schema Changes**: I propose adding a `source` field to the [Activity](file:///l:/source/pejotinha-v4/src/actions/ai.ts#92-98) model to track where logs come from (Manual, Git, DevOps, VSCode).
> **Webhook Secret**: We need a way to generate and store a `PEJOTINHA_WEBHOOK_SECRET`. I'll implement this in the Profile's `settings` JSON to avoid schema migrations unless preferred.

## Proposed Changes

### 🛡️ Core & Security

#### [MODIFY] [settings.ts](file:///l:/source/pejotinha-v4/src/actions/settings.ts)
- Update [SaveSettingsInput](file:///l:/source/pejotinha-v4/src/actions/settings.ts#8-20) interface to include `webhookSecret`.
- Add logic to generate a secure random secret if one doesn't exist.
- Ensure `webhookSecret` is masked in [getSanitizedSettings](file:///l:/source/pejotinha-v4/src/actions/settings.ts#52-78).

---

### 🔌 Integrations API

#### [NEW] [git.ts](file:///l:/source/pejotinha-v4/src/app/api/integrations/git/commit/route.ts)
- Implement `POST` endpoint to receive Husky post-commit hooks.
- Logic to parse `client_slug` from branch name (`client/<slug>/...`).
- Logic to map commits to the correct freelancer and project.
- Create [Activity](file:///l:/source/pejotinha-v4/src/actions/ai.ts#92-98) and `Evidence` entries for each commit.

#### [NEW] [azure-devops.ts](file:///l:/source/pejotinha-v4/src/app/api/integrations/azure-devops/route.ts)
- Implement `POST` endpoint for Azure DevOps Service Hooks.
- Support for PR, Pipeline, and Work Item events.
- Validate payload using shared secret.

#### [NEW] [vscode.ts](file:///l:/source/pejotinha-v4/src/app/api/integrations/vscode/session/route.ts)
- Implement `POST` endpoint for the VSCode extension (Roadmap).
- Store passive tracking data (duration, files touched).

---

### 🤖 AI Enhancements

#### [MODIFY] [ai.ts](file:///l:/source/pejotinha-v4/src/actions/ai.ts)
- Implement `generateNarrativeSummary(activities: Activity[])` server action.
- Craft a prompt that turns raw technical events into client-friendly narratives.

---

### 🎨 UI & Dashboard

#### [MODIFY] [Settings Component](file:///l:/source/pejotinha-v4/src/components/settings/settings-form.tsx)
- Add "Integrations" section.
- Display the `PEJOTINHA_WEBHOOK_SECRET`.
- Provide code snippets for `.husky/post-commit` as described in [CLAUDE.md](file:///l:/source/pejotinha-v4/CLAUDE.md).

#### [MODIFY] [Timeline Component](file:///l:/source/pejotinha-v4/src/components/activities/timeline.tsx)
- Add a "Magic Narrator" button to generate batch summaries for the day/selected items.

## Verification Plan

### Automated Tests
*None currently exist. I recommend adding a basic `curl` test suite:*
- `curl -X POST .../api/integrations/git/commit` with mock payload and valid/invalid tokens.
- `curl -X POST .../api/integrations/azure-devops` with mock ADO payload.

### Manual Verification
1. **Settings**: Navigate to `/settings`, verify the webhook secret is generated and can be copied.
2. **Git Hook**: Configure a dummy repo with the `post-commit` hook and verify activities appear in Pejotinha.
3. **AI Narrator**: Click the "Magic Narrator" button on a timeline with multiple commits and verify it produces a coherent summary.
4. **Multi-tenancy**: Verify that webhooks from User A do not create activities for User B.
