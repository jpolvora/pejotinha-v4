# 🚶 Walkthrough: Script de Verificação de Sanidade (`check:all`)

## 📝 Resumo
Para elevar a segurança e a confiabilidade do ambiente de desenvolvimento, implementamos um comando unificado de verificação de sanidade. O `npm run check:all` realiza uma bateria de testes rápidos que garantem que o código está bem formatado, sem erros de tipagem e com a conexão à infraestrutura local (PostgreSQL e Supabase) operacional.

## 🛠️ Mudanças Implementadas

### 🧐 Novo Script de Sanidade (`scripts/check-sanity.mjs`)
- **Validação de Infraestrutura**: 
    - Testa a conexão direta com o PostgreSQL via Prisma Client.
    - Realiza um ping HTTP para a API local do Supabase.
    - Verifica a existência do arquivo `.env`.
- **Relatório Detalhado**: Emite mensagens coloridas e claras sobre o status de cada componente.

### ⚙️ Configuração do `package.json`
- **Comando `type-check`**: Adicionado para rodar o compilador TypeScript sem emitir arquivos (`tsc --noEmit`).
- **Comando `check:all`**: Orquestra as verificações de Lint, Tipos e Sanidade de Conexão em uma única esteira.

### 📚 Documentação
- **README.md**: Adicionada a seção "Verificação de Sanidade" no passo a passo de setup rápido.

## 🧪 Testes de Validação

| Verificação | Comando | Resultado |
|-------------|---------|-----------|
| **Conexão DB** | `node scripts/check-sanity.mjs` | ✅ Sucesso! |
| **Integridade de Tipos** | `npm run type-check` | ✅ Sucesso! |
| **Pipeline Completa** | `npm run check:all` | ✅ Sucesso! |

> [!TIP]
> Use o `npm run check:all` sempre após um `git pull` ou antes de iniciar uma nova feature para garantir que seu ambiente está perfeito.
