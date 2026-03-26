-- Fix Supabase Permissions and Enable RLS
-- This script should be run after 'npx prisma db push' 
-- because Prisma doesn't handle Supabase-specific roles and RLS policies.

-- 1. Grant Schema Usage and Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Ensure default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- 3. Function to automatically create a profile for new users (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS for Application Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Customers
DROP POLICY IF EXISTS "Freelancers can view own customers" ON public.customers;
CREATE POLICY "Freelancers can view own customers" ON public.customers FOR SELECT USING (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can insert own customers" ON public.customers;
CREATE POLICY "Freelancers can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can update own customers" ON public.customers;
CREATE POLICY "Freelancers can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can delete own customers" ON public.customers;
CREATE POLICY "Freelancers can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = freelancer_id);

-- Projects
DROP POLICY IF EXISTS "Freelancers can view own projects" ON public.projects;
CREATE POLICY "Freelancers can view own projects" ON public.projects FOR SELECT USING (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can create own projects" ON public.projects;
CREATE POLICY "Freelancers can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can update own projects" ON public.projects;
CREATE POLICY "Freelancers can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Freelancers can delete own projects" ON public.projects;
CREATE POLICY "Freelancers can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "Clients can view assigned projects" ON public.projects;
CREATE POLICY "Clients can view assigned projects" ON public.projects FOR SELECT USING (auth.uid() = client_profile_id);

-- Activities
DROP POLICY IF EXISTS "Freelancers can view activities for their projects" ON public.activities;
CREATE POLICY "Freelancers can view activities for their projects" ON public.activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can insert activities for their projects" ON public.activities;
CREATE POLICY "Freelancers can insert activities for their projects" ON public.activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can update activities for their projects" ON public.activities;
CREATE POLICY "Freelancers can update activities for their projects" ON public.activities FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can delete activities for their projects" ON public.activities;
CREATE POLICY "Freelancers can delete activities for their projects" ON public.activities FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Clients can view activities of assigned projects" ON public.activities;
CREATE POLICY "Clients can view activities of assigned projects" ON public.activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_profile_id = auth.uid()));

-- Evidences
DROP POLICY IF EXISTS "Freelancers can view evidences of their projects" ON public.evidences;
CREATE POLICY "Freelancers can view evidences of their projects" ON public.evidences FOR SELECT USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can insert evidences to their activities" ON public.evidences;
CREATE POLICY "Freelancers can insert evidences to their activities" ON public.evidences FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can update evidences of their projects" ON public.evidences;
CREATE POLICY "Freelancers can update evidences of their projects" ON public.evidences FOR UPDATE USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Freelancers can delete evidences of their projects" ON public.evidences;
CREATE POLICY "Freelancers can delete evidences of their projects" ON public.evidences FOR DELETE USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Clients can view evidences of assigned projects" ON public.evidences;
CREATE POLICY "Clients can view evidences of assigned projects" ON public.evidences FOR SELECT USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.client_profile_id = auth.uid()));

-- Approvals
DROP POLICY IF EXISTS "Freelancers can view approvals of their activities" ON public.approvals;
CREATE POLICY "Freelancers can view approvals of their activities" ON public.approvals FOR SELECT USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.freelancer_id = auth.uid()));
DROP POLICY IF EXISTS "Clients can insert approvals for assigned activities" ON public.approvals;
CREATE POLICY "Clients can insert approvals for assigned activities" ON public.approvals FOR INSERT WITH CHECK (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.activities a JOIN public.projects p ON a.project_id = p.id WHERE a.id = activity_id AND p.client_profile_id = auth.uid()));
DROP POLICY IF EXISTS "Clients can view own approvals" ON public.approvals;
CREATE POLICY "Clients can view own approvals" ON public.approvals FOR SELECT USING (auth.uid() = client_id);
DROP POLICY IF EXISTS "Clients can update own approvals" ON public.approvals;
CREATE POLICY "Clients can update own approvals" ON public.approvals FOR UPDATE USING (auth.uid() = client_id);

-- Tasks
DROP POLICY IF EXISTS "Freelancers can access their own tasks" ON public.tasks;
CREATE POLICY "Freelancers can access their own tasks" ON public.tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.freelancer_id = auth.uid()));

-- Expenses
DROP POLICY IF EXISTS "Freelancers can access their own expenses" ON public.expenses;
CREATE POLICY "Freelancers can access their own expenses" ON public.expenses FOR ALL USING (auth.uid() = freelancer_id);

-- Invoices
DROP POLICY IF EXISTS "Freelancers can access their own invoices" ON public.invoices;
CREATE POLICY "Freelancers can access their own invoices" ON public.invoices FOR ALL USING (auth.uid() = freelancer_id);

-- Personal Events
DROP POLICY IF EXISTS "Freelancers can access their own personal events" ON public.personal_events;
CREATE POLICY "Freelancers can access their own personal events" ON public.personal_events FOR ALL USING (auth.uid() = freelancer_id);

-- 6. Reload Postgrest schema cache
NOTIFY pgrst, 'reload schema';
