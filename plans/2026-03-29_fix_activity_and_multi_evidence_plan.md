# Plano de Desenvolvimento: Correção e Evolução do Log de Atividades v4

**Data:** 2026-03-29
**Task:** Corrigir erro de UUID, melhorar upload (storage) e suportar múltiplas evidências (Imagens, GIFs, Vídeos).
**Agent:** Senior Full Stack Architect

## 🎯 Objetivos
1.  **Eliminar o Erro P2007:** Garantir que campos UUID vazios não quebrem a inserção no banco.
2.  **Múltiplas Evidências:** Permitir que o usuário suba vários arquivos de uma vez.
3.  **Suporte de Mídia:** Aceitar GIFs e vídeos curtos, mantendo a experiência fluida.
4.  **Resiliência no Storage:** Garantir caminhos de arquivo únicos e evitar falhas silenciosas no upload.

## 🏗️ Arquitetura
- **Server Action:** `src/actions/activities.ts` será refatorada para iterar sobre múltiplos arquivos vindos do `FormData`.
- **Database:** Uso da tabela `Evidence` (já existente no schema Prisma).
- **Storage:** Supabase Storage (bucket `evidence-storage`).
- **UI:** `src/components/log-activity-form.tsx` receberá um dropzone aprimorado ou input múltiplo com previews dinâmicos.

## 📝 Passo a Passo

### Fase 1: Correção do Core (Server Action)
- [ ] Modificar `createActivity` em `src/actions/activities.ts` para converter `taskId` vazio em `null`.
- [ ] Alterar o loop de evidências para iterar sobre múltiplos valores de um mesmo campo `evidence_files` ou similar.
- [ ] Implementar detecção de `evidenceType` baseada na extensão/mime-type (`image`, `video`, `gif`, `document`).

### Fase 2: Evolução do Frontend
- [ ] Atualizar `LogActivityForm` em `src/components/log-activity-form.tsx`.
- [ ] Implementar estado local para gerenciar a lista de arquivos selecionados antes do envio.
- [ ] Renderizar previews específicos:
    *   `<img>` para fotos/gifs.
    *   `<video>` (muted/autoplay/loop) para vídeos curtos.
- [ ] Garantir que o `formData` seja montado corretamente com todos os arquivos anexados.

### Fase 3: Segurança e Validação
- [ ] Validar tipos de arquivos permitidos no lado do cliente e do servidor.
- [ ] Implementar verificação de tamanho máximo (limite para vídeos para não estourar o storage rapidamente).
- [ ] Garantir que o `freelancer_id` seja verificado em todas as operações (Multi-tenancy).

## ✅ Critérios de Aceite
- [ ] Salvar atividade sem `taskId` não gera erro 500.
- [ ] Submeter 3 fotos e 1 vídeo ao mesmo tempo e vê-los vinculados à atividade.
- [ ] GIFs reproduzindo no preview.
- [ ] Redirecionamento após sucesso para o projeto correto.

## 🔗 Referências
- `src/actions/activities.ts`
- `src/components/log-activity-form.tsx`
- `prisma/schema.prisma`
