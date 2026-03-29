# Plano de Implementação: Melhorias no Formulário de Evidências

Este plano descreve a implementação de uma seção de links dinâmicos no formulário de registro de atividades, permitindo múltiplos links com metadados estruturados.

## 🎯 Objetivos
- Adicionar suporte a múltiplas linhas de links de evidência.
- Campos por linha: Tipo (Commit, PR, Docs, Outros), URL, e Data/Hora.
- Funcionalidade de Adicionar/Remover linhas.
- Confirmação ao remover evidências persistidas.
- Melhorar a UX da seção de evidências com um design "Premium".

## 🏗️ Arquitetura e Mudanças

### 1. Backend (Server Actions)
- **Arquivo**: `src/actions/activities.ts`
- **Alteração**: Atualizar `createActivity` e `updateActivity` para processar o campo opcional `evidence_created_at_${i}`.
- **Lógica**: Se fornecido, usar esse valor para o campo `createdAt` do Prisma ao criar o registro de evidência.

### 2. Frontend (Estado e Tipagem)
- **Arquivo**: `src/components/log-activity-form.tsx`
- **Alteração**: 
    - Atualizar tipo `Evidence` para incluir `createdAt?: string`.
    - Adaptar `actionWithData` para incluir os novos campos no `FormData`.
    - Criar estados auxiliares ou expandir o `evidences` para suportar a UI de lista de links.

### 3. Interface de Usuário (UI/UX)
- **Componente**: `LogActivityForm.tsx`
- **Novos Elementos**:
    - Seção "Links de Referência" com layout tabular ou em lista.
    - Select para Tipos: `commit`, `pull_request`, `documentation`, `other`.
    - Input de URL e Datetime-local para cada linha.
    - Botão "Adicionar Novo Link" com ícone Lucide.
    - Botão de deleção com confirmação (Dialog ou standard `window.confirm` estilizado).

### 4. Integração com Paste/Upload
- Manter o suporte a CTRL+V. Arquivos colados continuam aparecendo no grid de cards.
- Links colados podem ser automaticamente sugeridos ou adicionados a essa nova lista estruturada.

## 🛠️ Tarefas
1. [ ] Modificar `src/actions/activities.ts` para aceitar `created_at` nas evidências.
2. [ ] Modificar `Evidence` type em `LogActivityForm.tsx`.
3. [ ] Implementar a lógica de adição de linhas vazias no estado.
4. [ ] Implementar a UI da seção de links estruturados.
5. [ ] Implementar a lógica de confirmação ao remover (apenas se `ev.id` existir e não for temporário).
6. [ ] Validar o envio de dados via `Server Action`.

## ✅ Critérios de Aceite
- [ ] Usuário consegue adicionar 5 links diferentes.
- [ ] Cada link pode ter um tipo selecionado.
- [ ] A data/hora do link é persistida corretamente.
- [ ] Ao tentar remover um link que já está no banco, um aviso de confirmação aparece.
- [ ] O formulário continua funcionando para uploads de arquivos normais e IA extraction.
