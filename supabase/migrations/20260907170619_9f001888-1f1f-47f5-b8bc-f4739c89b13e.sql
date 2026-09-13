CREATE POLICY "Creators can upload their own gift media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gift-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can read their own gift media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gift-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can update their own gift media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gift-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete their own gift media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gift-media' AND auth.uid()::text = (storage.foldername(name))[1]);