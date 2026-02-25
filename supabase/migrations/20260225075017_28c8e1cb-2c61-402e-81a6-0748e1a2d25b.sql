
-- Fix: Change SELECT policies to PERMISSIVE for public read access
-- Tasks
DROP POLICY IF EXISTS "All authenticated users can view tasks" ON public.tasks;
CREATE POLICY "All authenticated users can view tasks" ON public.tasks FOR SELECT TO public USING (true);

-- Members  
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
CREATE POLICY "Anyone can view members" ON public.members FOR SELECT TO public USING (true);

-- Documents
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
CREATE POLICY "Anyone can view documents" ON public.documents FOR SELECT TO public USING (true);

-- Also make documents insert/update permissive for anon access (since no auth yet)
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
CREATE POLICY "Anyone can insert documents" ON public.documents FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
CREATE POLICY "Anyone can update documents" ON public.documents FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Make members insert/update permissive for demo
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
CREATE POLICY "Anyone can insert members" ON public.members FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update members" ON public.members;
CREATE POLICY "Anyone can update members" ON public.members FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Make tasks update permissive
DROP POLICY IF EXISTS "All users can update task priority" ON public.tasks;
CREATE POLICY "All users can update task priority" ON public.tasks FOR UPDATE TO public USING (true) WITH CHECK (true);
