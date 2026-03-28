# Walkthrough de Correção: Setup Cloud (Remoto)

## O que foi corrigido?
- [x] O comando `npm run setup:cloud` não tentará mais rodar o banco sem as chaves reais.
- [x] O script agora gera templates reais da nuvem Supabase em vez de chaves do local dev.
- [x] Implementado isolamento de env entre o ambiente local e remoto.

## Instruções para o Primeiro Uso da Nuvem:

1.  **Gere as configurações iniciais**:
    ```bash
    npm run setup:cloud
    ```
    Isso criará (ou atualizará) o arquivo `.env.cloud`.

2.  **Abra o arquivo `.env.cloud` no VS Code** e preencha as variáveis obtidas no Dashboard do Supabase:
    *   **DATABASE_URL**: Altere o host para o seu e coloque a **senha** que você criou no Dashboard do Supabase.
    *   **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Pegue em `Project Settings > API`.
    *   **SUPABASE_SERVICE_ROLE_KEY**: Importante para a sincronização de usuários.

3.  **Sincronize o banco remoto**:
    ```bash
    npm run db:push:cloud
    ```

---
*Senior Full Stack Architect - Pejotinha-v4 Team*
