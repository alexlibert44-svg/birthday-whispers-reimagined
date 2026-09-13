import { supabase } from "@/integrations/supabase/client";
import type { MediaItem } from "./gift";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogv", "3gp"];
const AUDIO_EXT = ["mp3", "wav", "m4a", "ogg", "oga", "aac", "flac", "opus"];

export type UploadKind = "image" | "video" | "audio";

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** Some Android pickers report an empty or generic mime type, so fall back to the extension. */
export function detectKind(file: File): UploadKind | null {
  const type = file.type?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  const ext = extOf(file.name);
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (AUDIO_EXT.includes(ext)) return "audio";
  return null;
}

export class UploadError extends Error {
  code: "format" | "size" | "failed";
  constructor(code: "format" | "size" | "failed", message: string) {
    super(message);
    this.code = code;
  }
}

/** A stable, unguessable folder for this browser's uploads. No account required. */
function localOwnerId(): string {
  const key = "lumiere.owner";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export async function uploadFile(
  file: File,
  expected?: UploadKind | UploadKind[],
): Promise<MediaItem & { kind: UploadKind }> {
  const kind = detectKind(file);
  const allowed = expected ? (Array.isArray(expected) ? expected : [expected]) : null;
  if (!kind || (allowed && !allowed.includes(kind))) {
    throw new UploadError("format", "Unsupported file type");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError("size", "File too large");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60) || "file";
  const path = `${localOwnerId()}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from("gift-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    ...(file.type ? { contentType: file.type } : {}),
  });
  if (error) throw new UploadError("failed", error.message);

  const { data, error: signError } = await supabase.storage
    .from("gift-media")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new UploadError("failed", "Could not create a link for the file");

  return {
    kind,
    type: kind === "video" ? "video" : "image",
    url: data.signedUrl,
    path,
    caption: "",
  };
}

export async function removeGiftFile(path?: string | null) {
  if (!path) return;
  try {
    await supabase.storage.from("gift-media").remove([path]);
  } catch {
    /* best effort */
  }
}
