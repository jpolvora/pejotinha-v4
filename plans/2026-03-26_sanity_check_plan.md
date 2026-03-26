# 📋 Plano: Script de Verificação de Sanidade (`check:all`)

Este plano define as etapas para criar um comando unificado de verificação do ambiente, garantindo que o código, os tipos e a infraestrutura estejam saudáveis.

## 🎯 Objetivos
- Criar um script `scripts/check-sanity.mjs` para validar conexões (DB e Supabase).
- Implementar o comando `npm run check:all` no `package.json`.
- Integrar verificações de Lint, TypeScript e Conectividade.

## 🛠️ Etapas

### 1. Desenvolvimento do Script de Sanidade
- [ ] Criar `scripts/check-sanity.mjs`.
- [ ] Validar existência do `.env`.
- [ ] Testar conexão com o PostgreSQL (via Prisma ou TCP).
- [ ] Testar conectividade com a API do Supabase local.

### 2. Configuração do `package.json`
- [ ] Adicionar o script `type-check`: `tsc --noEmit`.
- [ ] Adicionar o script `check:all`: `npm run lint && npm run type-check && node scripts/check-sanity.mjs`.

### 3. Validação e Testes
- [ ] Executar `npm run check:all`.
- [ ] Verificar comportamento em caso de falha (ex: banco desligado).

### 4. Documentação
- [ ] Atualizar `README.md` com o novo comando de utilidade.
- [ ] Gerar walkthrough da implementação.

## ✅ Critérios de Aceite
- O comando `npm run check:all` deve falhar se qualquer etapa (lint, tipo ou conexão) falhar.
- Saída visual elegante e informativa no terminal.
