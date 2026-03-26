# Pejotinha v4 — Freelancer Dashboard & Proof of Work

> Turn your real dev workflow into automatic, client-ready proof of work. Every commit, PR, meeting and AI session becomes a timestamped work entry — no manual logging required.

---

## What is it?

Pejotinha is a self-hosted SaaS platform for freelancers who want to stop manually writing reports and start generating them from signals that already exist in their workflow. It connects your git history, code editor, project management tools and communication channels into a single timeline — and uses AI to turn raw events into professional client reports.

---

## Tech stack

- **Frontend** — Next.js 15 (App Router), Tailwind CSS v4, Shadcn/UI, Lucide React
- **Backend / BaaS** — Supabase (self-hosted or cloud) — Auth, Storage, Edge Functions
- **ORM** — Prisma (PostgreSQL)
- **AI** — Vercel AI SDK (Google Gemini / OpenAI)
- **Security** — AES-256-GCM encryption for credentials, Husky + Secretlint on every commit
- **Infra** — Docker multi-stage (development & runner)

---

## Workflow integrations

### Git + Husky → automatic commit logs

Every commit you push becomes a proof-of-work entry. A post-commit hook sends the commit hash, message, branch, and changed files to the Pejotinha API. No extra steps — it fires silently in the background without blocking your commit.

**Branch naming convention for automatic client mapping:**
```
client/<client-slug>/<description>
# example: client/acme-corp/fix-authentication-flow
```

**Setup — add to `.husky/post-commit`:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
FILES_CHANGED=$(git diff-tree --no-commit-id -r --name-only HEAD | tr '\n' ',')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CLIENT_SLUG=$(echo "$BRANCH" | sed -n 's|client/\([^/]*\)/.*|\1|p')

curl -s -X POST "$PEJOTINHA_API_URL/api/integrations/git/commit" \
  -H "Authorization: Bearer $PEJOTINHA_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d "{
    \"hash\": \"$COMMIT_HASH\",
    \"message\": \"$COMMIT_MSG\",
    \"branch\": \"$BRANCH\",
    \"client_slug\": \"$CLIENT_SLUG\",
    \"files_changed\": \"$FILES_CHANGED\",
    \"timestamp\": \"$TIMESTAMP\"
  }" &
```

Add `PEJOTINHA_API_URL` and `PEJOTINHA_WEBHOOK_SECRET` to your local `.env`. The `&` forks the process — zero impact on commit speed.

---

### Azure DevOps → milestone-level evidence

Pull requests, pipeline runs, and work item status changes fire webhooks automatically. Each event maps to a proof-of-work entry that carries far more weight with clients than a raw commit list.

**Events captured:**
- PR opened / approved / merged
- Pipeline succeeded / failed
- Work item moved to Done

**Setup — configure a Service Hook in Azure DevOps:**

Project settings → Service hooks → Web hooks → point to:
```
POST https://your-domain/api/integrations/azure-devops
```

Each event is validated with a shared secret and stored as a timestamped entry linked to the matching client project.

---

### AI summarization → human-readable daily reports

Raw signals (commits, PRs, meetings) are useful as evidence but not readable as client reports. A nightly job — or an on-demand button in the dashboard — batches the day's entries and asks Gemini to generate a narrative summary.

**Example input:**
```
- 09:14 commit: fix token refresh race condition (auth/refresh.ts)
- 11:30 PR merged: feature/payment-webhook (#47)
- 14:00 meeting: Sprint review — 45 min — 4 attendees
- 16:22 commit: add Stripe webhook signature validation
```

**Example AI output:**
> Resolved a token refresh race condition affecting authenticated sessions. Delivered the payment webhook feature including Stripe signature validation. Attended sprint review meeting (45 min).

This summary is attached to the timeline entry and included verbatim in the client-facing PDF report.

---

### VSCode extension → passive session tracking

A lightweight extension tracks active editing time per workspace and flushes a session log to Pejotinha on window close or at a configurable interval. It captures which files were touched and for how long — turning a 3-hour coding session into a documented work entry without any manual input.

**Planned capture:**
- Active workspace / project name
- Files edited (by extension group — no content, only filenames)
- Total focused editing time
- AI assistant prompts count (Copilot, Gemini Code Assist, etc.)

> The VSCode extension is on the roadmap. The API endpoint is ready — contributions welcome.

---

## Quick start

### Prerequisites

- Git
- Docker / Docker Desktop
- Node.js 20+

### Setup

```bash
git clone https://github.com/jpolvora/pejotinha-v4.git
cd pejotinha-v4
npm run setup   # configures .env, starts Supabase, seeds the database
npm run dev
```

### Default credentials (seed data)

| Role | Email | Password |
|---|---|---|
| Admin | admin@email.com | P@ssword! |
| Freelancer | freelancer@pejotinha.dev | P@ssword! |

### Local services

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |
| Mailpit | http://localhost:54324 |

---

## Screenshots

| Dashboard | Projects | Timeline |
|---|---|---|
| ![Dashboard](public/screenshots/dashboard.png) | ![Projects](public/screenshots/projects.png) | ![Project Details](public/screenshots/project_details.png) |

| Log activity (AI assisted) | Clients | Login |
|---|---|---|
| ![Log Activity](public/screenshots/log_activity.png) | ![Clients](public/screenshots/clients.png) | ![Login](public/screenshots/login.png) |

---

## Production deploy (Coolify / Umbrel / Portainer)

```bash
# 1. Edit deploy.sh — set your GitHub username
# 2. Build and push the optimised standalone image
npm run deploy

# 3. On your server, use the generated image:
# ghcr.io/<your-username>/pejotinha-v4:latest
# Set all .env variables in your orchestrator pointing to your Supabase instance
```

---

## Security

- **AES-256-GCM** encryption for all user integration credentials (Telegram tokens, API keys)
- `ENCRYPTION_SECRET` is generated automatically during setup — never lose this key in production
- **Secretlint** runs on every commit via Husky — credentials cannot be accidentally committed
- Webhook endpoints validate shared secrets on every inbound request

---

## Contributing

```bash
git checkout -b client/<your-slug>/your-feature
git commit -m "feat: description"
git push origin client/<your-slug>/your-feature
# open a pull request
```

---

## License

Developed by **Jone Polvora**. Focused on productivity for the freelancer community.