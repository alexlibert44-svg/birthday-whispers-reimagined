ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS owner_hash text;
CREATE INDEX IF NOT EXISTS gifts_owner_hash_idx ON public.gifts (owner_hash);