# Implementation Plan: My Profile Page

## 1. Analysis & Preparation
- **Entities**: Supabase Auth (User), Prisma (Profile).
- **Current State**: `Settings` page exists but "My Profile" is requested separately.
- **Fields for display**: Username (Profile.fullName), Email (Auth), Provider (Auth).
- **Fields for edit**: fullName (Prisma).
- **Actions**: Change Password, Logout, Delete Account.

## 2. Server Actions (`src/actions/user-actions.ts`)
- `updateProfile(formData: FormData)`: Updates `fullName` in the `Profile` table.
- `updatePassword(formData: FormData)`: Updates password in Supabase Auth.
- `deleteAccount()`: 
    1.  Get current user ID.
    2.  Delete from Prisma (cascading deletes for projects, customers, etc.).
    3.  Delete from Supabase Auth (`admin.deleteUser`). Wait, `admin` needs service role.
    4.  Actually, we can delete the record in Prisma easily. For Supabase Auth, the user can't delete themselves via the standard client. We might need a service-role client OR just sign them out and mark as "deleted" (but the user wants "limpando todos os seus registros").
    5.  Since it's a private SaaS, we should have a way to fully delete. I'll check if we have a service role client or if I should create one.

## 3. UI Components
### 3.1 Sidebar (`src/components/sidebar.tsx`)
- Add "Meu Perfil" link with `User` icon.
- Icon: `User` (from lucide-react).

### 3.2 User Dropdown (`src/components/dashboard/user-dropdown.tsx`)
- Add "Meu Perfil" link above the "Configurações" link.

### 3.3 Profile Page (`src/app/(dashboard)/profile/page.tsx`)
- **Layout**: Clean, premium, card-based.
- **Form**: `useActionState` for updates.
- **Feedback**: Sonner toasts (already used in the project).

## 4. Account Deletion Logic
- Prisma: `prisma.profile.delete({ where: { id: userId } })`.
- Supabase: Deleting the `Profile` row in `public.profiles` (Prisma-managed) won't delete the `auth.users` row.
- I'll need a trigger in Supabase `auth` or a service-role action to delete the auth user.
- Alternatively, if I delete the `auth.users` row via SQL/Service Role, it will trigger the deletion of the `Profile` (if there's a trigger) or I handle it in Prisma first.

## 5. Implementation Steps
1.  Add link to Sidebar.
2.  Add link to UserDropdown.
3.  Create `src/actions/user.ts`.
4.  Create `src/app/(dashboard)/profile/page.tsx`.
5.  Test all flows.
