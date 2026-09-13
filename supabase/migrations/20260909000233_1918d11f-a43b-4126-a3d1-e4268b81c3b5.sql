ALTER TABLE public.gifts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS surprise_media jsonb,
  ADD COLUMN IF NOT EXISTS decorations jsonb NOT NULL DEFAULT '["balloons","confetti","sparkles"]'::jsonb,
  ADD COLUMN IF NOT EXISTS edit_token_hash text;

ALTER TABLE public.gifts ALTER COLUMN creator_id SET DEFAULT gen_random_uuid();

DROP POLICY IF EXISTS "Anyone with the link can view a gift" ON public.gifts;
DROP POLICY IF EXISTS "Creators can delete their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Creators can insert their own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Creators can update their own gifts" ON public.gifts;

REVOKE ALL ON public.gifts FROM anon, authenticated;

GRANT SELECT (id, recipient_name, nickname, celebrate_at, time_zone, main_message,
  extra_messages, final_message, surprise_message, photos, music_url, music_enabled,
  theme, accent_color, decoration_emoji, language, media, surprise_media, decorations,
  created_at, updated_at) ON public.gifts TO anon, authenticated;

GRANT ALL ON public.gifts TO service_role;

CREATE POLICY "Anyone with the link can view a gift"
  ON public.gifts FOR SELECT TO anon, authenticated USING (true);