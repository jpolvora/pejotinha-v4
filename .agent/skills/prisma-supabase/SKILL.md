---
name: prisma-supabase
description: Hybrid workflow for managing Prisma schema changes alongside Supabase-specific features (RLS, Triggers, Storage).
---

# 🛠️ Prisma-Supabase Hybrid Workflow

Este skill define o protocolo para lidar com mudanças no banco de dados, garantindo que a infraestrutura do Supabase (RLS, Triggers e Storage) seja mantida em sincronia com o schema do Prisma.

## 🔄 Protocolo de Mudança de Banco de Dados

Siga estes passos sempre que houver menção a "prisma" ou mudanças no banco:

1. **Alterar Schema**: Modifique o arquivo `prisma/schema.prisma` conforme necessário.
2. **Gerar Migração (Sem Aplicar)**: Execute o comando:
   ```bash
   npx prisma migrate dev --create-only
   ```
   *Isso gerará uma nova pasta de migração e o arquivo `migration.sql` sem modificar o banco ainda.*
3. **Injetar Lógica Supabase**:
   - Localize o novo arquivo `migration.sql` gerado.
   - **Manual**: Abra o arquivo e adicione ao final as políticas de RLS, Triggers ou configurações de Storage necessárias para as novas tabelas/campos.
   - *Referência*: Use o arquivo `prisma/migrations/20260325000000_initial_migration/migration.sql` como guia de padrões.
4. **Finalizar Migração**:
   - Execute o comando para aplicar a migração editada:
     ```bash
     npx prisma migrate dev
     ```
   - Ou use o script de setup do projeto:
     ```bash
     npm run setup
     ```
5. **Validar Permissões**: Verifique se as novas tabelas têm RLS habilitado e se as roles do Supabase (`authenticated`, `anon`) têm as permissões corretas.

## 🔐 Regra de Ouro (Isolamento)
Toda nova tabela **DEVE** ter RLS habilitado e uma política que filtre pelo `freelancer_id` (ou ID correspondente do proprietário) para garantir o multi-tenancy.
