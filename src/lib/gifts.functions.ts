import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { rowToGift, type GiftConfig } from "./gift";

/* eslint-disable @typescript-eslint/no-explicit-any */

function keyedClient(key: string, url: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function publicClient() {
  return keyedClient(process.env["SUPABASE_PUBLISHABLE_KEY"]!, process.env["SUPABASE_URL"]!);
}

function adminClient() {
  return keyedClient(process.env["SUPABASE_SERVICE_ROLE_KEY"]!, process.env["SUPABASE_URL"]!);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const PUBLIC_COLUMNS =
  "id,recipient_name,nickname,celebrate_at,time_zone,main_message,extra_messages,final_message,surprise_message,photos,music_url,music_enabled,theme,accent_color,decoration_emoji,language,media,surprise_media,decorations,created_at,updated_at";

export type GiftSummary = {
  id: string;
  recipientName: string;
  celebrateAt: string;
  updatedAt: string;
};

type GiftInput = {
  recipientName: string;
  nickname: string | null;
  celebrateAt: string;
  timeZone: string;
  language: string;
  mainMessage: string;
  extraMessages: string[];
  finalMessage: string;
  surpriseMessage: string;
  surpriseMedia: any;
  media: any[];
  musicUrl: string | null;
  musicEnabled: boolean;
  theme: string;
  accentColor: string;
  decorations: string[];
};

function toRow(input: GiftInput) {
  return {
    recipient_name: input.recipientName,
    nickname: input.nickname,
    celebrate_at: input.celebrateAt,
    time_zone: input.timeZone,
    language: input.language === "ar" ? "ar" : "en",
    main_message: input.mainMessage,
    extra_messages: input.extraMessages.filter((m) => m.trim()),
    final_message: input.finalMessage,
    surprise_message: input.surpriseMessage,
    surprise_media: input.surpriseMedia ?? null,
    media: input.media,
    photos: [],
    music_url: input.musicUrl,
    music_enabled: input.musicEnabled && !!input.musicUrl,
    theme: input.theme,
    accent_color: input.accentColor,
    decorations: input.decorations,
  };
}

/**
 * Public read of one gift. Everything that belongs to the celebration is stripped
 * server-side until the configured moment, so the surprise cannot be revealed early.
 */
export const getPublicGift = createServerFn({ method: "GET" })
  .inputValidator((data: { giftId: string }) => data)
  .handler(async ({ data }): Promise<GiftConfig | null> => {
    const { data: row, error } = await publicClient()
      .from("gifts")
      .select(PUBLIC_COLUMNS)
      .eq("id", data.giftId)
      .maybeSingle();

    if (error || !row) return null;

    const gift = rowToGift(row);
    const unlocked = Date.now() >= new Date(gift.celebrateAt).getTime();

    if (!unlocked) {
      return {
        ...gift,
        mainMessage: "",
        extraMessages: [],
        finalMessage: "",
        surpriseMessage: "",
        surpriseMedia: null,
        media: [],
        musicUrl: null,
      };
    }

    return gift;
  });

/** Create a gift without any account. Returns the public id and the private edit token. */
export const createGift = createServerFn({ method: "POST" })
  .inputValidator((data: GiftInput & { ownerKey?: string }) => data)
  .handler(async ({ data }): Promise<{ id: string; token: string }> => {
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const { data: row, error } = await adminClient()
      .from("gifts")
      .insert({
        ...toRow(data),
        edit_token_hash: await sha256(token),
        owner_hash: data.ownerKey ? await sha256(data.ownerKey) : null,
      })
      .select("id")
      .single();

    if (error || !row) throw new Error(error?.message ?? "Could not create the gift");
    return { id: row.id as string, token };
  });

/** Every gift created from this browser, straight from the cloud database. */
export const listMyGifts = createServerFn({ method: "GET" })
  .inputValidator((data: { ownerKey: string }) => data)
  .handler(async ({ data }): Promise<GiftSummary[]> => {
    if (!data.ownerKey) return [];
    const { data: rows, error } = await adminClient()
      .from("gifts")
      .select("id,recipient_name,celebrate_at,updated_at")
      .eq("owner_hash", await sha256(data.ownerKey))
      .order("updated_at", { ascending: false });
    if (error || !rows) return [];
    return rows.map((r: any) => ({
      id: r.id as string,
      recipientName: r.recipient_name as string,
      celebrateAt: r.celebrate_at as string,
      updatedAt: r.updated_at as string,
    }));
  });

async function authorize(
  row: any,
  creds: { token?: string | undefined; ownerKey?: string | undefined },
): Promise<boolean> {
  if (creds.token && row.edit_token_hash === (await sha256(creds.token))) return true;
  if (creds.ownerKey && row.owner_hash && row.owner_hash === (await sha256(creds.ownerKey))) {
    return true;
  }
  return false;
}

/** Read a gift with all its content, for the creator (edit link or owner key). */
export const getGiftForEdit = createServerFn({ method: "GET" })
  .inputValidator((data: { giftId: string; token?: string; ownerKey?: string }) => data)
  .handler(async ({ data }): Promise<GiftConfig | null> => {
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("gifts")
      .select("*")
      .eq("id", data.giftId)
      .maybeSingle();
    if (error || !row) return null;
    if (!(await authorize(row, data))) return null;
    return rowToGift(row);
  });

export const updateGift = createServerFn({ method: "POST" })
  .inputValidator(
    (data: GiftInput & { giftId: string; token?: string; ownerKey?: string }) => data,
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const admin = adminClient();
    const { data: row } = await admin
      .from("gifts")
      .select("id,edit_token_hash,owner_hash")
      .eq("id", data.giftId)
      .maybeSingle();
    if (!row || !(await authorize(row, data))) {
      throw new Error("This edit link is not valid");
    }
    const patch: Record<string, unknown> = {
      ...toRow(data),
      updated_at: new Date().toISOString(),
    };
    // Claim ownership for this browser when the gift has no owner yet.
    if (!(row as any).owner_hash && data.ownerKey) {
      patch["owner_hash"] = await sha256(data.ownerKey);
    }
    const { error } = await admin.from("gifts").update(patch).eq("id", data.giftId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
