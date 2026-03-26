# 📋 Plan: Premium Timeline Pro

## 🎯 Objectives
- Transform the basic dashboard timeline into a "Premium" visual experience.
- Unify Git commits, manual activities, IA logs, and personal events.
- Add visual indicators for evidence and specific sources.
- Improve the overall aesthetics of the Dashboard using Tailwind v4 principles.

## 🛠️ Proposed Steps

### Phase 1: Data Integration
1. **Update `getIntegratedTimeline`**:
   - Fetch `source` and `evidences` from the `Activity` table.
   - Include `projectSlug` for better context.
   - Ensure sorting by `startTime` (most recent first).

### Phase 2: UI/UX Enhancement
1. **Premium Palette**: Use specific color-coding for each event type:
   - **Manual/Default**: Primary (Blue/Indigo)
   - **Git**: Deep Indigo
   - **IA/Magic**: Fuchsia/Sparkles
   - **Personal**: Orange
   - **Private/Anon**: Gray/Muted
2. **Interactive Elements**:
   - Add hover effects (glassmorphism cards).
   - Display `Badge` for project identification.
   - Add icons for "Evidence Count" and "Git Link".
3. **Typography & Layout**:
   - Use bold tracking-tighter for stats.
   - Improve spacing and vertical line gradients.

### Phase 3: Verification
1. Verify icons are correctly rendered.
2. Ensure RLS still applies through the server action.
3. Test layout responsiveness.

## 🧪 Verification Criteria
- Timeline shows distinct icons for different sources.
- Project slugs are visible as badges.
- Evidence count is displayed when applicable.
- Dashboard stats cards have a modern, premium look with subtle icons.
