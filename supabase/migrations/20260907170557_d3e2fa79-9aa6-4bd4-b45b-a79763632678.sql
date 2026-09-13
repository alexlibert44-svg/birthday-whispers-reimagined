CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  recipient_name text NOT NULL,
  nickname text,
  celebrate_at timestamptz NOT NULL,
  time_zone text NOT NULL DEFAULT 'UTC',
  main_message text NOT NULL DEFAULT '',
  extra_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  final_message text NOT NULL DEFAULT '',
  surprise_message text NOT NULL DEFAULT '',
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  music_url text,
  music_enabled boolean NOT NULL DEFAULT false,
  theme text NOT NULL DEFAULT 'midnight',
  accent_color text NOT NULL DEFAULT '#f5c26b',
  decoration_emoji text NOT NULL DEFAULT '🎁',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gifts TO authenticated;
GRANT SELECT ON public.gifts TO anon;
GRANT ALL ON public.gifts TO service_role;

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with the link can view a gift"
  ON public.gifts FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert their own gifts"
  ON public.gifts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own gifts"
  ON public.gifts FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own gifts"
  ON public.gifts FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER gifts_set_updated_at
  BEFORE UPDATE ON public.gifts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();