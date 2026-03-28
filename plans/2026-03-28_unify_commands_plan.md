# Plano de Unificação de Comandos e Contexto

## Data: 2026-03-28
## Status: Concluído ✅

### 1. Objetivo
Simplificar a experiência do desenvolvedor removendo a necessidade de comandos duplicados (ex: dev vs dev:cloud) e automatizando a detecção do ambiente de execução.

### 2. Implementação
- [x] **Setup Inteligente**: `setup.mjs` agora grava `PJ_ENV=local|cloud` no `.env.local`.
- [x] **Proxy de Execução**: Criado `env-run.mjs` que lê o `PJ_ENV` e usa `dotenv-cli` para injetar o arquivo `.env` ou `.env.cloud` correto.
- [x] **Limpeza de Manifest**: `package.json` higienizado, removendo scripts redundantes.

### 3. Resultados
- Redução de complexidade no `README.md`.
- Workflow mais intuitivo: um único comando para cada tarefa (`dev`, `db:push`, `reset:db`).
- Menor chance de erro humano ao rodar comandos no ambiente errado.
