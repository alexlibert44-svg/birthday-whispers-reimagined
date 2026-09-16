ALTER TABLE public.gifts
  ADD COLUMN IF NOT EXISTS message_frame_style text NOT NULL DEFAULT 'cinematic',
  ADD COLUMN IF NOT EXISTS message_frame_color text;