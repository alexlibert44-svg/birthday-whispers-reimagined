DROP POLICY IF EXISTS "Creators can upload their own gift media" ON storage.objects;
DROP POLICY IF EXISTS "Creators can read their own gift media" ON storage.objects;
DROP POLICY IF EXISTS "Creators can update their own gift media" ON storage.objects;
DROP POLICY IF EXISTS "Creators can delete their own gift media" ON storage.objects;
DROP POLICY IF EXISTS "gift media insert" ON storage.objects;
DROP POLICY IF EXISTS "gift media select" ON storage.objects;
DROP POLICY IF EXISTS "gift media delete" ON storage.objects;

CREATE POLICY "gift media insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'gift-media');

CREATE POLICY "gift media select" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gift-media');

CREATE POLICY "gift media delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'gift-media');