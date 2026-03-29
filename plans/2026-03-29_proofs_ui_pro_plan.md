# Plano: Proofs UI Pro & Melatags Refinement

Elevando a visualização de evidências (Proof of Work) para um nível profissional, com foco em interatividade e clareza.

## 🎯 Objetivos
- [ ] **Galeria de Evidências Premium:** Substituir a lista simples por um componente de Grid/Carousel com previews interativos (Lightbox embutido ou Modal).
- [ ] **Suporte a Mídia Avançado:** Melhorar o tratamento de vídeos (`.mp4`, `.webm`) e documentos.
- [ ] **Actionable Evidence:** Links de commits devem abrir o repositório diretamente se detectados.
- [ ] **Integração de Task Context:** Exibir a tarefa vinculada de forma proeminente na timeline.

## 🛠️ Passos

### Fase 1: Padronização de Toasts & Feedback
- [ ] Substituir `alert` por `toast` em `EvidenceManager.tsx`.
- [ ] Adicionar estados de loading reais nos botões de exclusão.

### Fase 2: Componente `EvidenceGallery` (UI Pro)
- [ ] Criar `src/components/evidence-gallery.tsx`.
- [ ] Implementar suporte a aspect-ratio fixo para imagens.
- [ ] Adicionar Tooltips para metadados (data de upload, tipo).

### Fase 3: Refatoração da Timeline (`src/app/(dashboard)/projects/[id]/page.tsx`)
- [ ] Integrar o novo `EvidenceGallery`.
- [ ] Melhorar a visualização da tarefa vinculada (Badge proeminente).

### Fase 4: Automação de Links
- [ ] Detectar URLs de GitHub/GitLab/Jira automaticamente para transformar em links ricos.

## ✅ Critérios de Sucesso
- Evidências devem ser visualmente atraentes e fáceis de navegar.
- Erros em mutações de evidência devem ser reportados via `toast`.
- O histórico de trabalho deve parecer um "portfólio de engenharia".
