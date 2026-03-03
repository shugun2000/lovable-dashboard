
-- Create storage bucket for document files
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files
CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

-- Allow anyone to upload files (demo mode)
CREATE POLICY "Public insert documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Add file_url column to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_url text;
