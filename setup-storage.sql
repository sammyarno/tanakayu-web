-- Create storage bucket for rich text images
INSERT INTO storage.buckets (id, name, public)
VALUES ('rich-text-images', 'rich-text-images', true);

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rich-text-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'uploads'
);

-- Allow public access to view images
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rich-text-images'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rich-text-images' 
  AND auth.role() = 'authenticated'
);

-- Optional: Set file size limit (5MB) and allowed file types
-- This would be configured in the Supabase dashboard under Storage settings