# [PLAN] 2026-03-27 - Atualização de Modelos Gemini (Refinado)

O usuário relatou que os modelos Gemini atuais (2.0 Flash Lite) não estão funcionando para novos usuários. Pesquisas indicam que em Março de 2026, a série Gemini 2.0 foi substituída pela série Gemini 2.5 e Gemini 3. 

**Refinamento**: Removido o endpoint `v1` para evitar erros de compatibilidade com os modelos novos ("not found for API version v1"). Listagem de modelos simplificada para apenas as versões 2.5 e 3.0.

## User Review Required

> [!IMPORTANT]
> Apenas os modelos das séries Gemini 2.5 e 3.0 foram mantidos, garantindo que "apenas o que funciona" esteja visível.

> [!WARNING]
> O endpoint estável `v1` foi removido para o provedor Gemini, pois os modelos mais novos exigem obrigatoriamente `v1beta`.

## Proposed Changes

### [Frontend] Configurações de IA

#### [MODIFY] [settings-form.tsx](file:///l:/source/pejotinha-v4/src/app/(dashboard)/settings/settings-form.tsx)
- Removido `generativelanguage.googleapis.com/v1` da lista de endpoints.
- Atualizada a lista `MODELS.gemini` para:
  - `gemini-3.1-pro`
  - `gemini-3-flash`
  - `gemini-3.1-flash-lite`
  - `gemini-2.5-pro`
  - `gemini-2.5-flash`
- Modelo padrão de fallback atualizado para `gemini-3-flash`.

### [Backend] Ações de IA

#### [MODIFY] [ai.ts](file:///l:/source/pejotinha-v4/src/actions/ai.ts)
- Atualizados fallbacks de modelo para `gemini-3-flash`.

## Open Questions

- Nenhuma no momento.

## Verification Plan

### Manual Verification
1. Acessar a tela de Settings.
2. Verificar que o modelo padrão é `gemini-3-flash` e o endpoint é `v1beta`.
3. Testar a extração de dados.
