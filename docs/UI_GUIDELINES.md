# 🎨 UI & Design Guidelines

Este documento define os padrões visuais e de layout do Pejotinha-v4 para garantir consistência em todas as telas.

## 🏗️ Layout de Página

Todas as páginas principais devem utilizar o sistema de container padronizado:

1. **Outer Container**: Use a classe `.screen-container` definida no CSS global.
   - Aplica um padding horizontal de `2rem`.
   - Garante que o conteúdo não encoste nas bordas da sidebar ou da tela.

2. **Page Header**: Use o componente `<PageHeader />` para títulos de página.
   - Mantém o espaçamento consistente entre o título, subtítulo e o conteúdo abaixo.
   - Segue a hierarquia visual do "Agile Taskboard".

```tsx
import { PageHeader } from "@/components/layout/page-header";

export default function MyPage() {
  return (
    <div className="screen-container">
      <PageHeader 
        title="Meu Título" 
        subtitle="Uma breve descrição da funcionalidade"
      />
      {/* Conteúdo da página */}
    </div>
  );
}
```

## 🌓 Temas (Dark & Light)

O sistema utiliza `next-themes` para alternância de cores.

- **Contrast Rule**: Todos os componentes (especialmente Selects, Dropdowns e Modais) devem ter bordas (`border-border`) e fundos (`bg-background` ou `bg-card`) claramente definidos para ambos os temas.
- **Micro-animações**: Utilize Framer Motion para transições de estado (ex: abrir de modais, troca de abas).

## 🌍 Internacionalização (i18n)

- **Text Extraction**: Nunca use strings hardcoded em componentes.
- **Hook usage**: Utilize `useTranslations` do `next-intl`.
- **Locale persistence**: A preferência de idioma é salva em um cookie persistente.

## 🛠️ Componentes em Destaque

- **Toasts**: Utilize o sistema `sonner` para notificações.
- **Loading states**: Use esqueletos (`Skeleton`) ou spinners padronizados durante operações assíncronas.
