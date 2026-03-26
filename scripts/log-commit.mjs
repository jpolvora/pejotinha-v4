import { execSync } from 'child_process';

/**
 * PEJOTINHA COMMIT LOGGER
 * -----------------------
 * Este script automatiza o envio de commits para o Pejotinha-v4.
 * Pode ser usado em um hook de Git (Husky).
 * 
 * Configuração:
 * 1. Defina PEJOTINHA_WEBHOOK_SECRET no seu .env ou ambiente.
 * 2. Defina o SLUG do projeto no script ou em um arquivo .pejotinha.json.
 */

const API_URL = process.env.PEJOTINHA_API_URL || 'http://localhost:3000/api/integrations/git/commit';
const WEBHOOK_SECRET = process.env.PEJOTINHA_WEBHOOK_SECRET;
const PROJECT_SLUG = process.env.PEJOTINHA_PROJECT_SLUG;

async function logCommit() {
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ PEJOTINHA_WEBHOOK_SECRET não configurado. O commit não será registrado no dashboard.');
    return;
  }

  if (!PROJECT_SLUG) {
    console.warn('⚠️ PEJOTINHA_PROJECT_SLUG não configurado. O commit não será registrado no dashboard.');
    return;
  }

  try {
    console.log('📤 Enviando commit para o Pejotinha...');

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
      console.log(`✅ Sucesso! Atividade registrada no Pejotinha (ID: ${data.activityId})`);
    } else {
      console.error('❌ Erro na API do Pejotinha:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro ao registrar commit:', error.message);
  }
}

logCommit();
