# Plano de Correção: Setup Cloud (npm run setup:cloud)

## Data: 2026-03-28
## Status: Concluído ✅

### 1. Análise do Problema
O comando `npm run setup:cloud` falhava ao tentar executar `prisma db push` imediatamente após a criação do `.env.cloud`. O Prisma utilizava os valores de localhost do `.env` e falhava porque o banco estava desligado, além de que o `.env.cloud` gerado não continha os templates de URL remota corretos.

### 2. Ações Tomadas
- [x] Modificação do `scripts/setup-cloud.mjs` para injetar modelos de URL remota (`db.project-ref.supabase.co`).
- [x] Remoção da execução automática do banco no comando `setup:cloud`.
- [x] Criação do comando `db:push:cloud` que utiliza o `dotenv-cli` para carregar o arquivo correto.

### 3. Verificação
- O comando `npm run setup:cloud` executado com sucesso (Exit Code 0).
- Arquivo `.env.cloud` conferido e validado com os novos templates.
