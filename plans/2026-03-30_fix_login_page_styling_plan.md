# Plan - Fix Login Page Styling (Premium Theme)

## Goal
Fix the login page contrast, font, and icon issues while adding a "Premium Architect" dynamic feel (Next.js 16.2 + Tailwind v4 + Glassmorphism).

## Tasks
- [ ] Task 1: Update `login-form.tsx` background with dynamic animated blobs for better depth → Verify: Open login page, see moving gradients.
- [ ] Task 2: Fix `CardTitle` and `CardDescription` contrast. Use theme-aware colors (`text-foreground` or a robust gradient) → Verify: Title clearly visible in both light and dark modes.
- [ ] Task 3: Improve Alert (`state?.message`) styling. Replace `-foreground` text for low-opacity backgrounds with direct `text-primary/destructive` → Verify: Messages are readable.
- [ ] Task 4: Enhance Inputs and Icons. Add better focus rings, glass borders, and consistent Lucide icon weights → Verify: Input focus and icons have high contrast.
- [ ] Task 5: Refactor "Pejotinha workspace" logo at the top left to have better visibility and alignment → Verify: Logo is clear.
- [ ] Task 6: Add micro-animations (Framer Motion or CSS transitions) for mode switching (Login/Signup) → Verify: Smooth transitions.

## Done When
- [ ] Login page has high contrast and is readable in both Light and Dark modes.
- [ ] Background has a premium, dynamic feel with animated blobs.
- [ ] "Invalid API key" and other status messages are perfectly legible.
- [ ] All Lucide icons have consistent, high-contrast colors.
