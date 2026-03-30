# Plan: Internationalization (i18n) Implementation

## 🎯 Goal
Implement a complete i18n solution for Pejotinha-v4 supporting **pt-BR**, **en-US**, and **es-LA** using `next-intl`.

## 🏗️ Technical Approach
1. **Core Library:** `next-intl` (recommended for Next.js App Router).
2. **Routing:** Locale-based routing (`/en-us/page`, `/pt-br/page`, etc.) with a default locale prefix strategy of `as-needed`.
3. **Storage:** User preference stored in a cookie.
4. **Structure:** Routes moved to `src/app/[locale]/`.
5. **Localization Files:** JSON files located in `src/messages/`.

## 🚶 Phases

### Phase 1: Setup & Configuration
- [ ] Install `next-intl`.
- [ ] Create `src/messages/pt-BR.json`, `en-US.json`, `es-LA.json`.
- [ ] Implement `src/i18n/request.ts`.
- [ ] Setup `src/middleware.ts`.
- [ ] Update `next.config.js` with `next-intl` plugin.

### Phase 2: Structural Changes
- [ ] Move existing routes from `src/app/` to `src/app/[locale]/` (excluding `api`, `auth`, etc.).
- [ ] Update `layout.tsx` for locale context.
- [ ] Implement the `LanguageSwitcher` in the dashboard topbar.

### Phase 3: Extraction & Implementation
- [ ] Extract hardcoded strings:
    - Sidebar items & Global Header.
    - Dashboard widgets.
    - Activity Forms & Evidence labels.
    - Login & Invitations.
- [ ] Replace with `t('key')`.

### Phase 4: Localization for Messages & Notifications
- [ ] Localize `sonner` toasts and error messages.
- [ ] Verify Server Action response localization.

## 🏁 Verification (UAT)
- [ ] Language dropdown works.
- [ ] URL `/en-us/` works correctly.
- [ ] Toasts are translated.
- [ ] Language is saved in the browser.
