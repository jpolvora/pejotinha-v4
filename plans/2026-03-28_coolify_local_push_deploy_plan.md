# Plano de Implementação: Deploy Automatizado via Coolify (Fluxo Docker Push)

Este plano descreve as etapas para automatizar o deploy do **Pejotinha-v4** no Coolify utilizando o fluxo de build local, push para registry e trigger via API.

## 🎯 Objetivos
- Configurar o projeto para suportar build local e push para um registry (Docker Hub, GHCR ou Local Coolify).
- Implementar um script de trigger que avisa o Coolify sobre a nova imagem.
- Permitir a criação/configuração remota da aplicação via API do Coolify.

---

## 🏗️ Fases de Implementação

### Fase 1: Configuração do Ambiente (`.env`)
Adicionar variáveis necessárias para a comunicação com o Coolify no `.env.example` e documentar como o usuário deve preencher no `.env.local`.
- `PJ_COOLIFY_URL`: URL da sua instância (ex: `http://192.168.0.70:8000`)
- `PJ_COOLIFY_TOKEN`: API Token gerado no dashboard.
- `PJ_COOLIFY_SERVER_ID`: UUID do servidor destino.
- `PJ_COOLIFY_PROJECT_ID`: UUID do projeto.
- `PJ_COOLIFY_APP_NAME`: Nome da aplicação no Coolify.
- `PJ_DOCKER_REGISTRY`: O registry que será usado (ex: `ghcr.io` ou `192.168.0.70:5000`).

### Fase 2: Script de Trigger (`scripts/coolify-trigger.mjs`)
Criar um script robusto em Node.js que:
1. Valida se a aplicação já existe no Coolify.
2. Se não existir, cria a aplicação usando o endpoint `/api/v1/applications/dockerimage`.
3. Se existir, dispara o deploy (`POST /api/v1/applications/{uuid}/deploy`).

### Fase 3: Integração no Bash (`deploy.sh`)
Atualizar o `deploy.sh` existente para:
1. Ler as novas variáveis de ambiente.
2. Após o `docker push` com sucesso, chamar o `node scripts/coolify-trigger.mjs`.

### Fase 4: Automação de Registro (Opcional)
Fornecer instruções de como autenticar o Docker no registry do Coolify (caso opte pelo registry local).

---

## ✅ Critérios de Aceite
- [ ] O comando `npm run deploy` deve buildar a imagem production-ready.
- [ ] A imagem deve ser "empurrada" para o registry configurado.
- [ ] O Coolify deve receber a notificação e iniciar o deploy do container.
- [ ] Logs claros no console indicando o sucesso de cada etapa.

---
*Senior Full Stack Architect - Pejotinha-v4 Team*
