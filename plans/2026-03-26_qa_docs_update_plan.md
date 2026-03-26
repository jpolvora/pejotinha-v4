# 📋 Plano: Validação de Setup e Atualização de Documentação (QA & Docs)

Este plano define as etapas para validar o processo de setup do projeto, realizar testes de fumaça e atualizar a documentação técnica para refletir o estado atual do software.

## 🎯 Objetivos
- Validar se `npm run setup` funciona perfeitamente em ambiente Windows.
- Garantir que todas as dependências e variáveis de ambiente sejam configuradas corretamente.
- Atualizar `README.md` e `SPECS.md` com as últimas funcionalidades implementadas.
- Verificar a integridade do banco de dados e do sistema de autenticação local.

## 🛠️ Etapas

### 1. Preparação e Análise de Setup
- [ ] Verificar `package.json` e scripts de automação.
- [ ] Analisar `scripts/setup-env.mjs` para garantir compatibilidade com Windows.
- [ ] Checar se o Docker está rodando (pré-requisito).

### 2. Execução do Setup (Stress Test)
- [ ] Rodar `npm run setup` e capturar logs.
- [ ] Validar a criação do arquivo `.env`.
- [ ] Confirmar se o Supabase local subiu corretamente (`npx supabase status`).
- [ ] Verificar se as migrações do Prisma foram aplicadas (`npx prisma db push`).
- [ ] Validar a sincronização de usuários de teste no Supabase Auth.
- [ ] Confirmar a aplicação das regras de RLS via `scripts/setup-supabase.sql`.

### 3. Testes de Fumaça (QA)
- [ ] Acessar [http://localhost:3000](http://localhost:3000) e validar login com `admin@email.com`.
- [ ] Verificar se o Dashboard carrega os dados do seed.
- [ ] Testar a criação de um novo log de atividade (Proof of Work).

### 4. Atualização de Documentação
- [ ] Revisar `README.md`: Adicionar seção de Troubleshooting ou melhorias no fluxo de setup.
- [ ] Atualizar `SPECS.md`: Marcar funcionalidades como concluídas (Toasts, Evidence System, etc.).
- [ ] Gerar walkthrough detalhado do processo de QA.

## ✅ Critérios de Aceite
- Setup finalizado sem erros manuais.
- Documentação sincronizada com o código.
- Ambiente de desenvolvimento pronto para uso imediato.
