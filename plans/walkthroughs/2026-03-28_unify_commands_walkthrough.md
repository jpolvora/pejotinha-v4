# Walkthrough: Novo Workflow de Comandos Unificados

## O que foi corrigido?
- [x] Unificação de comandos (`dev`, `db:push`, etc.) para Local e Cloud.
- [x] Persistência do estado do ambiente no `.env.local`.
- [x] Remoção de scripts `:cloud` obsoletos no `package.json`.

## Como funciona o novo sistema?

### 📦 Setup Único
Ao rodar `npm run setup`, o assistente pergunta sua preferência (**Local** ou **Cloud**). Essa escolha fica salva em `.env.local` na variável `PJ_ENV`.

### 🚀 Comandos Inteligentes
Os scripts do `package.json` agora rodam através do `node scripts/env-run.mjs`. Esse script atua como um coordenador:
1.  Lê o seu ambiente salvo (`local` ou `cloud`).
2.  Carrega o arquivo `.env` (se local) ou `.env.cloud` (se cloud).
3.  Executa o comando original (`next dev`, `prisma db push`, etc.) com as variáveis injetadas.

## Vantagens
- **Simplicidade**: Você só precisa se preocupar com um conjunto de comandos.
- **Segurança**: Evita rodar scripts de banco de dados locais no ambiente de nuvem acidentalmente.
- **Portabilidade**: Quer trocar de ambiente? Basta rodar o `setup` e mudar a opção. O seu `npm run dev` se adaptará sozinho no próximo comando.

---
*Senior Full Stack Architect - Pejotinha-v4 Team*
