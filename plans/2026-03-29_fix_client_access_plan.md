# Plano de Implementação: Correção de Acesso à Área do Cliente

O objetivo deste plano é garantir que clientes cujos e-mails foram cadastrados pelo freelancer em sua ficha de cliente comercial (`Customer`) tenham acesso automático aos projetos associados na "Área do Cliente".

## 🛠️ Mudanças Necessárias

### 1. Frontend: Área do Cliente (`src/app/(dashboard)/client/page.tsx`)
- Atualizar a query `prisma.project.findMany` para incluir o filtro: `{ customer: { email: user.email } }` dentro do bloco `OR`.
- Isso garante que, mesmo sem um vínculo explícito de ID, a correspondência por e-mail funcione.

### 2. Backend: Server Actions de Projetos (`src/actions/projects.ts`)
- Em `createProject` e `updateProject`, adicionar lógica para:
  1. Obter o e-mail do `Customer`.
  2. Buscar um `Profile` com esse e-mail.
  3. Se encontrado, definir o `clientProfileId` no projeto.

### 3. Backend: Server Actions de Clientes (`src/actions/customers.ts`)
- Em `updateCustomer`, se o e-mail for alterado:
  1. Buscar um `Profile` com o novo e-mail.
  2. Se encontrado, atualizar todos os projetos vinculados a esse cliente definindo o `clientProfileId`.

## ✅ Critérios de Aceite
- [ ] Um usuário logado como `admin@email.com` consegue ver os projetos onde o seu e-mail consta na ficha do cliente.
- [ ] Ao criar um novo projeto para esse cliente, o vínculo de perfil ocorre automaticamente se o usuário já estiver cadastrado.
- [ ] Ao atualizar o e-mail de um cliente existente, o acesso é refletido nos projetos.

## 📝 Instruções de Uso (Resumo)
1. No menu **Clientes**, edite ou crie o cliente e informe o e-mail dele (ex: `admin@email.com`).
2. O cliente, ao acessar a plataforma com esse mesmo e-mail, verá automaticamente todos os projetos vinculados a ele na **Área do Cliente**.
3. Convites explícitos ainda podem ser usados para convidar supervisores ou gerentes adicionais para o mesmo projeto.
