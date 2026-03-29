# Pejotinha-v4 Project Roadmap

## 🎯 Vision
Pejotinha is the ultimate Multi-tenant SaaS for Freelancers, focusing on **Proof of Work (PoW)** and transparent client relationships through AI-powered logging and evidence management.

## 🗺️ Future Phases

### 🟢 Phase 1: Client Experience & Portal Refinement
- **Objective**: Improve how freelancers interact with clients and how clients accept invitations.
- **Key Tasks**:
    - [ ] Implementation of a "Send Invitation" UI in the Clients/Projects management pages.
    - [ ] Refinement of the `invite/[token]` landing page for new clients.
    - [ ] Dedicated "Client View" dashboard for users with the `client` role.
- **Verification**: User can send an email (simulated/real), client clicks link, creates profile, and sees their assigned projects.

### 🟡 Phase 2: Proofs UI Pro (Visual & Verification)
- **Objective**: Modernize the evidence gallery and provide better proof-of-work visualization.
- **Key Tasks**:
    - [ ] Implementation of an Evidence Gallery (Lightbox/Slider for images).
    - [ ] Direct preview for Link evidences (OpenGraph support or simple preview).
    - [ ] Activity "Revision" workflow UI: Client marks "Needs revision" and Freelancer gets a focused task.
- **Verification**: Images/Videos can be viewed without downloading; revision status is visually distinct.

### 🔴 Phase 3: Financial Core & Automated Billing
- **Objective**: Transform activities into professional financial documents.
- **Key Tasks**:
    - [ ] Automated Invoice generation based on monthly activities.
    - [ ] **PDF Export Engine**: Generate professional invoices with company/freelancer logos.
    - [ ] "Mark as Paid" bulk action with automatic billing notifications.
- **Verification**: Downloadable PDF Invoice with correct calculations based on `hourly_rate`.

---

## 🛠️ Infrastructure Sync (Tech Debt)
- [ ] Implement Automated E2E tests for the auth flow.
- [ ] Standardized `scripts/checklist.py` integration for PR checks.
- [ ] Migrate any remaining legacy `.mjs` scripts to a unified `src/scripts` structure if needed.
