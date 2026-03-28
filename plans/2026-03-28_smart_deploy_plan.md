# Plano de Deploy Inteligente

## Data: 2026-03-28
## Status: Concluído ✅

### 1. Objetivo
Unificar o comando `npm run deploy` para suportar tanto o build de containers Docker (Self-hosted) quanto a sincronização com o Supabase Cloud, dependendo do contexto salvo no `.env.local`.

### 2. Implementação
- [x] **Criação do Coordenador**: `scripts/deploy.mjs` para ler `PJ_ENV` e despachar o comando correto.
- [x] **Associação de Fluxos**:
    - `local` -> `sh deploy.sh` (Docker build/push).
    - `cloud` -> `sh scripts/deploy-cloud.sh` (Supabase Cloud Sync).
- [x] **Limpeza de Manifest**: Remoção do script `deploy:cloud` no `package.json`.

### 3. Resultados
- Processo de publicação simplificado.
- Documentação centralizada em um único comando.
- Redução de complexidade no `package.json`.
