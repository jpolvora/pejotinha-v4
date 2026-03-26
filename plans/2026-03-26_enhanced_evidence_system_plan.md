# Implementation Plan - Enhanced Evidence & Activity Tracking

This plan outlines the steps to add multiple evidence types (links, observations, commits), activity status visibility, and a "Mark as paid" feature.

## 1. Database Schema Updates (`prisma/schema.prisma`)
- [ ] Add `isPaid` (Boolean, default: `false`) to `Activity` model.
- [ ] Add `paidAt` (DateTime, optional) to `Activity` model.
- [ ] (Optional) Add `OBSERVATION` and `COMMIT` to `evidence_type` logic (currently a string, but we can standardize values).

## 2. Server Actions (`src/actions/activities.ts`)
- [ ] Update `createActivity` to accept `isPaid`.
- [ ] Create `updateActivity` action to modify status, description, and `isPaid`.
- [ ] Create `addEvidence` (generic) to support adding any type of evidence to an existing activity.
- [ ] Create `removeEvidence` action.

## 3. UI Components - Forms & Management
- [ ] **`src/components/log-activity-form.tsx`**:
    - Add "Mark as paid" checkbox.
    - Add UI pointers for "Observation" and "Commit" evidence types.
- [ ] **`src/components/evidence-manager.tsx`** (New/Refactored from `evidence-upload.tsx`):
    - Support adding Links, Commits, and Observations to existing activities.
    - List current evidences with "Delete" option.

## 4. UI Components - Activity Display
- [ ] Update the activity list items to:
    - Show **Paid/Unpaid** status.
    - Show **Approval Status** badge (`pending`, `approved`, `rejected`, `revision`).
    - Better preview for different evidence types (GitHub icon for commits, Link icon for URLs, etc.).

## 5. Verification
- [ ] Verify multi-tenancy (ensure only owners can edit/delete).
- [ ] Test the full flow: Create activity -> Add evidence -> Approve -> Mark as Paid.
