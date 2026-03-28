# Walkthrough: Publicação e Deploy Inteligente

## O que foi corrigido?
- [x] O comando `npm run deploy` agora é dinâmico.
- [x] Diferenciação inteligente entre build de imagem Docker e sincronização com Supabase Cloud.
- [x] Unificação das instruções no README.md.

## Como o Deploy funciona no Pejotinha v4?

### 📦 Você escolheu Self-Hosted (Opção 1):
Ao rodar `npm run deploy`, o sistema builda uma imagem Docker otimizada pronta para o seu próprio servidor. O script `deploy.sh` é quem faz esse trabalho pesado sob o capô.

### ☁️ Você escolheu Cloud-Hosted (Opção 2):
Ao rodar `npm run deploy`, o sistema sincroniza suas mudanças de schema do Prisma e suas Edge Functions diretamente com o Dashboard remoto do Supabase. O script `scripts/deploy-cloud.sh` entra em ação aqui.

## Importante:
- Se você trocar o contexto no `npm run setup`, o comando `deploy` se adapta automaticamente sem que você precise mudar nenhuma flag.

---
*Senior Full Stack Architect - Pejotinha-v4 Team*
