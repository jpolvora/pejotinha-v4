import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

// 1. Carregar variáveis do .env e .env.local
dotenv.config();
if (existsSync('.env.local')) {
  const envLocal = dotenv.config({ path: '.env.local', override: true });
}

const {
  PJ_COOLIFY_URL,
  PJ_COOLIFY_TOKEN,
  PJ_COOLIFY_SERVER_ID,
  PJ_COOLIFY_PROJECT_ID,
  PJ_COOLIFY_APP_NAME,
  PJ_DOCKER_REGISTRY,
  PJ_DOCKER_USERNAME
} = process.env;

const IMAGE_PATH = `${PJ_DOCKER_REGISTRY}/${PJ_DOCKER_USERNAME}/${PJ_COOLIFY_APP_NAME}:latest`;

async function triggerDeploy() {
  console.log('\n\x1b[36m🔔 [Coolify Trigger]\x1b[0m Iniciando comunicação...');

  if (!PJ_COOLIFY_TOKEN || !PJ_COOLIFY_URL) {
    console.error('❌ Erro: PJ_COOLIFY_TOKEN ou PJ_COOLIFY_URL não configurados no .env.local');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${PJ_COOLIFY_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    // 1. Verificar se a aplicação já existe
    console.log(`🔍 Buscando aplicação: ${PJ_COOLIFY_APP_NAME}...`);
    const listRes = await fetch(`${PJ_COOLIFY_URL}/api/v1/applications`, { headers });
    const apps = await listRes.json();

    let app = apps.find(a => a.name === PJ_COOLIFY_APP_NAME);

    if (app) {
      console.log(`✅ Aplicação encontrada (UUID: ${app.uuid}). Disparando deploy...`);
      const deployRes = await fetch(`${PJ_COOLIFY_URL}/api/v1/applications/${app.uuid}/deploy`, {
        method: 'POST',
        headers
      });

      if (deployRes.ok) {
        console.log('🚀 Deploy disparado com sucesso no Coolify!');
      } else {
        const err = await deployRes.text();
        console.error('❌ Erro ao disparar deploy:', err);
      }
    } else {
      console.log(`⚠️ Aplicação não encontrada. Tentando criar remotamente...`);
      
      const createData = {
        project_uuid: PJ_COOLIFY_PROJECT_ID,
        server_uuid: PJ_COOLIFY_SERVER_ID,
        environment_name: 'production',
        name: PJ_COOLIFY_APP_NAME,
        docker_registry_image_name: IMAGE_PATH,
        source_type: 'dockerimage'
      };

      const createRes = await fetch(`${PJ_COOLIFY_URL}/api/v1/applications/dockerimage`, {
        method: 'POST',
        headers,
        body: JSON.stringify(createData)
      });

      if (createRes.ok) {
        const newApp = await createRes.json();
        console.log(`🎉 Aplicação criada com sucesso! (UUID: ${newApp.uuid})`);
        console.log('⏳ Iniciando primeiro deploy...');
        
        await fetch(`${PJ_COOLIFY_URL}/api/v1/applications/${newApp.uuid}/deploy`, {
          method: 'POST',
          headers
        });
      } else {
        const err = await createRes.text();
        console.error('❌ Erro ao criar aplicação:', err);
      }
    }
  } catch (error) {
    console.error('❌ Erro na comunicação com a API do Coolify:', error.message);
    process.exit(1);
  }
}

triggerDeploy();
