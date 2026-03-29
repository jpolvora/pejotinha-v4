# 📝 Plano de Implementação: Taskboard Agile Refinement

Este plano descreve as melhorias no Taskboard para atingir o nível "Agile Pro", incluindo suporte a prioridades, tags, vínculo de atividades e melhorias visuais nos cards.

---

## 🏗️ 1. Alterações no Schema (Prisma)
Adicionar suporte a prioridades e tags diretamente no modelo `Task`.

- [ ] Criar enum `task_priority` (LOW, MEDIUM, HIGH, URGENT).
- [ ] Adicionar campo `priority` ao modelo `Task` (default: MEDIUM).
- [ ] Adicionar campo `tags` (String[]) ao modelo `Task`.
- [ ] Rodar `npx prisma db push` e `npx prisma generate`.

## ⚙️ 2. Atualização de Server Actions (`/src/actions/tasks.ts`)
Garantir que as novas propriedades sejam persistidas e criar lógica de vínculo.

- [ ] Atualizar `createTask` para aceitar `priority` e `tags`.
- [ ] Atualizar `createBatchTasks` (usado pela IA/Magic Log).
- [ ] Implementar `linkActivityToTask(taskId, activityId)` para associar logs de tempo.
- [ ] Melhorar `updateTaskPosition` para garantir integridade da ordem (opcional/ajuste).

## 🎨 3. Cards Pro & UI Refinement (`/src/components/taskboard`)
Transformar os cards básicos em componentes de alta densidade de informação.

- [ ] **KanbanCard:**
    - Exibir Badge de Prioridade com cores dinâmicas.
    - Listar Tags (máx 3 visíveis).
    - Exibir indicador de "Tempo Total" (calculado via `activities`).
    - Adicionar botão "Quick Log" (Timer) para iniciar atividade vinculada.
- [ ] **CreateTaskModal:**
    - Incluir campos de seleção de Prioridade e Input de Tags.

## 🔗 4. Vínculo de Atividades
Integrar as tarefas com o fluxo de registro de tempo.

- [ ] **LogActivityForm:** Adicionar seletor de Tarefa (filtrado pelo projeto selecionado).
- [ ] Atualizar `createActivity` para persistir o `taskId`.

---

## 🧪 Verificação & QA
- [ ] Testar criação de tarefa com prioridade Alta e verificar cor no card.
- [ ] Mover tarefa entre colunas e verificar persistência.
- [ ] Registrar atividade vinculada a uma tarefa e verificar se o tempo total no card é atualizado.
- [ ] Validar isolamento de dados (apenas tarefas do próprio freelancer).

## 📅 Timeline Estimada
- Fase 1 & 2: 30 min
- Fase 3: 45 min
- Fase 4: 20 min
- QA: 15 min
