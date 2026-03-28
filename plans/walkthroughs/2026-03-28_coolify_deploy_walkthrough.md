# Walkthrough: Deploy Automatizado Coolify (Local Push)

## O que foi implementado?
- [x] **Plano de Deploy**: Criado em `plans/2026-03-28_coolify_local_push_deploy_plan.md`.
- [x] **Variáveis de Ambiente**: `.env.example` atualizado com campos para Coolify e Docker Registry.
- [x] **Coolify Trigger Script**: `scripts/coolify-trigger.mjs` criado para falar com a API v1 do Coolify. 
    - Ele é inteligente: se a aplicação não existir no Coolify, ele cria remotamente usando a configuração de `dockerimage`. Se já existir, apenas dispara o deploy.
- [x] **Integração no Deploy**: `deploy.sh` agora é dinâmico e chama o trigger automaticamente após o push da imagem.

## Como usar?

### 1. Configuração no Coolify (Dashboard)
1. Ative o **Docker Registry** em `Settings > Docker Registry` se quiser usar o registro interno (opcional).
2. Gere um **API Token** em `Keys & Tokens`.

### 2. Configuração Local (`.env.local`)
Preencha as novas variáveis no seu `.env.local`:
```env
PJ_COOLIFY_URL=http://192.168.0.70:8000
PJ_COOLIFY_TOKEN=seu_token_aqui
PJ_COOLIFY_SERVER_ID=uuid_do_servidor
PJ_COOLIFY_PROJECT_ID=uuid_do_projeto
PJ_COOLIFY_APP_NAME=pejotinha-v4
PJ_DOCKER_REGISTRY=ghcr.io (ou o IP do seu coolify:5000)
PJ_DOCKER_USERNAME=seu_usuario
```

### 3. Execução
Basta rodar o comando de deploy unificado:
```bash
npm run deploy
```

O script irá:
1. Buildar a imagem de produção (`runner` stage).
2. Fazer o push para o Registry.
3. Avisar o Coolify via API para atualizar/criar o container.

---
*Senior Full Stack Architect - Pejotinha-v4 Team*
