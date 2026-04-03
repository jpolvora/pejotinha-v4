# 🔌 Integrations & Webhooks

Pejotinha-v4 supports automated activity logging via webhooks. This document describes how to integrate your development workflow with the Pejotinha API.

## 🔗 Git Commit Webhook

Automate your Proof of Work by logging every commit as an activity in Pejotinha.

**Endpoint:** `POST /api/integrations/git/commit`
**Authentication:** Bearer Token (Freelancer's `webhookSecret`)

### Payload Structure
```json
{
  "hash": "string (commit hash)",
  "message": "string (commit message)",
  "branch": "string (branch name)",
  "client_slug": "string (project slug in Pejotinha)",
  "files_changed": "string (list of changed files)",
  "timestamp": "string (ISO8601 date)"
}
```

### 🛠️ Husky Automation (Pre-commit / Post-commit)

You can use Husky to automatically send your commits to Pejotinha.

1. **Install Husky** (if not already):
   ```bash
   npm install husky --save-dev
   npx husky init
   ```

2. **Create the Logging Script** in `scripts/log-commit.mjs`:
   (See example in this repository's `scripts/` folder)

3. **Add to Husky hook**:
   In your `.husky/post-commit`:
   ```bash
   #!/usr/bin/env sh
   # Send commit to Pejotinha API
   node scripts/log-commit.mjs
   ```

### 📦 Example Husky Hook (`log-commit.mjs`)

```javascript
import { execSync } from 'child_process';
import fetch from 'node-fetch'; // or use native fetch in Node 18+

const API_URL = 'http://localhost:3000/api/integrations/git/commit';
const WEBHOOK_SECRET = process.env.PEJOTINHA_WEBHOOK_SECRET;
const PROJECT_SLUG = 'my-awesome-project'; // From .pejotinha.json or env

async function logCommit() {
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ PEJOTINHA_WEBHOOK_SECRET not set. Skipping...');
    return;
  }

  try {
    const hash = execSync('git rev-parse HEAD').toString().trim();
    const message = execSync('git log -1 --pretty=%B').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const files = execSync('git diff-tree --no-commit-id --name-only -r HEAD').toString().trim();
    const timestamp = new Date().toISOString();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        hash,
        message,
        branch,
        client_slug: PROJECT_SLUG,
        files_changed: files,
        timestamp
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log(`✅ Commit logged to Pejotinha: ${data.activityId}`);
    } else {
      console.error('❌ Failed to log commit:', data.error);
    }
  } catch (error) {
    console.error('❌ Error logging commit:', error.message);
  }
}

logCommit();
```

---

## 🚀 GitHub Actions CI/CD Pipeline

O Pejotinha-v4 possui um pipeline automatizado para builds e releases em ambiente Windows (via GitHub Actions).

### 🔄 Fluxo de Release
- **Trigger**: O pipeline é ativado automaticamente em todo `push` para a branch `main`.
- **Versioning**: O sistema utiliza o package versioning automático para gerar uma nova tag de release.
- **Artifacts**: Cada build gera um instalador/binário `.msi` ou executável (quando configurado) que é enviado para os GitHub Releases.

### 📋 Próximos Passos (Manual do Desenvolvedor)
Para que o pipeline funcione corretamente, configure estes `Secrets` no seu repositório:
1. `GH_TOKEN`: Token com permissões de escrita em Releases.
2. `CERTIFICATE_P12`: (Opcional) Certificado para assinatura de código.

---

## 🛡️ Security

- Keep your `webhookSecret` private. It acts as your API Key.
- Use HTTPS in production for all API calls.
- Avoid hardcoding API credentials in any pull request.
