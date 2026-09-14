import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, GripVertical, Loader2, Music2, Plus, Trash2, X } from "lucide-react";

import { BirthdayExperience } from "@/components/experience/BirthdayExperience";
import {
  ACCENTS,
  DECORATIONS,
  DEFAULT_DECORATIONS,
  THEMES,
  TIME_ZONES,
  utcToZonedFields,
  zonedToUtcISO,
  type DecorationKey,
  type GiftConfig,
  type MediaItem,
  type ThemeKey,
} from "@/lib/gift";
import { dirOf, translator, type Lang } from "@/lib/i18n";
import { UploadError, removeGiftFile, uploadFile } from "@/lib/media";
import { createGift, updateGift } from "@/lib/gifts.functions";
import { getOwnerKey } from "@/lib/owner";

const DRAFT_KEY = "lumiere.draft.v1";

type FormState = {
  recipientName: string;
  nickname: string;
  date: string;
  time: string;
  timeZone: string;
  language: Lang;
  mainMessage: string;
  extraMessages: string[];
  finalMessage: string;
  surpriseMessage: string;
  surpriseMedia: MediaItem | null;
  media: MediaItem[];
  musicUrl: string | null;
  musicPath: string | null;
  musicName: string;
  musicEnabled: boolean;
  theme: ThemeKey;
  accentColor: string;
  decorations: DecorationKey[];
};

function defaultState(uiLang: Lang): FormState {
  const tz =
    (typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";
  const tomorrow = new Date(Date.now() + 86_400_000);
  return {
    recipientName: "",
    nickname: "",
    date: tomorrow.toISOString().slice(0, 10),
    time: "00:00",
    timeZone: TIME_ZONES.includes(tz) ? tz : "UTC",
    language: uiLang,
    mainMessage: "",
    extraMessages: [],
    finalMessage: "",
    surpriseMessage: "",
    surpriseMedia: null,
    media: [],
    musicUrl: null,
    musicPath: null,
    musicName: "",
    musicEnabled: false,
    theme: "midnight",
    accentColor: THEMES.midnight.defaultAccent,
    decorations: DEFAULT_DECORATIONS,
  };
}

function stateFromGift(gift: GiftConfig): FormState {
  const { date, time } = utcToZonedFields(gift.celebrateAt, gift.timeZone);
  return {
    recipientName: gift.recipientName,
    nickname: gift.nickname ?? "",
    date,
    time,
    timeZone: gift.timeZone,
    language: gift.language,
    mainMessage: gift.mainMessage,
    extraMessages: gift.extraMessages,
    finalMessage: gift.finalMessage,
    surpriseMessage: gift.surpriseMessage,
    surpriseMedia: gift.surpriseMedia,
    media: gift.media,
    musicUrl: gift.musicUrl,
    musicPath: gift.musicPath ?? null,
    musicName: gift.musicUrl ? "audio" : "",
    musicEnabled: gift.musicEnabled,
    theme: gift.theme,
    accentColor: gift.accentColor,
    decorations: gift.decorations,
  };
}

/**
 * Defined at module scope on purpose: declaring this inside GiftEditor made
 * React unmount and remount every field on each keystroke, which closed the
 * mobile keyboard after a single character.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <h2 className="text-display text-lg text-white">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}



export function GiftEditor({
  mode,
  gift,
  token,
  uiLang,
}: {
  mode: "create" | "edit";
  gift?: GiftConfig | undefined;
  token?: string | undefined;
  uiLang: Lang;
}) {
  const t = translator(uiLang);
  const dir = dirOf(uiLang);

  const [form, setForm] = useState<FormState>(() => (gift ? stateFromGift(gift) : defaultState(uiLang)));
  const [busy, setBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSkip, setPreviewSkip] = useState(false);
  const [result, setResult] = useState<{ id: string; token: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const draftLoaded = useRef(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  /* ---------- local draft (create mode only) ---------- */
  useEffect(() => {
    if (mode !== "create" || draftLoaded.current) return;
    draftLoaded.current = true;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FormState;
      if (parsed && typeof parsed.recipientName === "string") {
        setForm({ ...defaultState(uiLang), ...parsed });
        toast.success(t("savedDraft"));
      }
    } catch {
      /* ignore a corrupted draft */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "create" || !draftLoaded.current) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {
        /* storage may be full or blocked */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [form, mode]);

  /* ---------- uploads ---------- */
  const handleUpload = useCallback(
    async (
      files: FileList | null,
      kinds: ("image" | "video" | "audio")[],
      slot: "media" | "surprise" | "music",
      input?: HTMLInputElement | null,
    ) => {
      if (!files || files.length === 0) return; // cancelled picker — stay exactly where we are
      setBusy(slot);
      try {
        for (const file of Array.from(files)) {
          const item = await uploadFile(file, kinds);
          if (slot === "media") {
            setForm((f) => ({ ...f, media: [...f.media, item] }));
          } else if (slot === "surprise") {
            setForm((f) => ({ ...f, surpriseMedia: item }));
          } else {
            setForm((f) => ({
              ...f,
              musicUrl: item.url,
              musicPath: item.path ?? null,
              musicName: file.name,
              musicEnabled: true,
            }));
          }
        }
        toast.success(t("mediaAdded"));
      } catch (err) {
        const code = err instanceof UploadError ? err.code : "failed";
        toast.error(code === "format" ? t("errFormat") : code === "size" ? t("errTooBig") : t("errUpload"));
      } finally {
        setBusy(null);
        if (input) input.value = ""; // allow picking the same file again
      }
    },
    [t],
  );

  /* ---------- preview gift object ---------- */
  const previewGift: GiftConfig = useMemo(
    () => ({
      id: gift?.id ?? "preview",
      recipientName: form.recipientName || (form.language === "ar" ? "صديقي" : "Friend"),
      nickname: form.nickname || null,
      celebrateAt: previewSkip
        ? new Date(Date.now() - 1000).toISOString()
        : zonedToUtcISO(form.date, form.time, form.timeZone),
      timeZone: form.timeZone,
      language: form.language,
      mainMessage: form.mainMessage || (form.language === "ar" ? "كل عام وأنت بخير!" : "Happy birthday!"),
      extraMessages: form.extraMessages.filter((m) => m.trim()),
      finalMessage: form.finalMessage,
      surpriseMessage: form.surpriseMessage,
      surpriseMedia: form.surpriseMedia,
      media: form.media,
      musicUrl: form.musicUrl,
      musicEnabled: form.musicEnabled && !!form.musicUrl,
      theme: form.theme,
      accentColor: form.accentColor,
      decorations: form.decorations,
    }),
    [form, gift?.id, previewSkip],
  );

  /* ---------- save ---------- */
  const save = async () => {
    if (!form.recipientName.trim()) {
      toast.error(t("errName"));
      return;
    }
    if (!form.mainMessage.trim()) {
      toast.error(t("errMessage"));
      return;
    }

    setSaving(true);
    const payload = {
      recipientName: form.recipientName.trim(),
      nickname: form.nickname.trim() || null,
      celebrateAt: zonedToUtcISO(form.date, form.time, form.timeZone),
      timeZone: form.timeZone,
      language: form.language,
      mainMessage: form.mainMessage,
      extraMessages: form.extraMessages,
      finalMessage: form.finalMessage,
      surpriseMessage: form.surpriseMessage,
      surpriseMedia: form.surpriseMedia,
      media: form.media,
      musicUrl: form.musicUrl,
      musicEnabled: form.musicEnabled,
      theme: form.theme,
      accentColor: form.accentColor,
      decorations: form.decorations,
    };

    const ownerKey = getOwnerKey();

    try {
      // Editing always updates the same gift — it never creates a copy.
      if (mode === "edit" && gift) {
        await updateGift({
          data: { ...payload, giftId: gift.id, ...(token ? { token } : {}), ownerKey },
        });
        toast.success(t("giftUpdated"));
      } else {
        const created = await createGift({ data: { ...payload, ownerKey } });
        setResult(created);
        try {
          window.localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        toast.success(t("giftSaved"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errSave"));
    } finally {
      setSaving(false);
    }
  };

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(key);
    toast.success(t("copied"));
    window.setTimeout(() => setCopied(null), 1800);
  };

  /* ---------- shared classes ---------- */
  const field =
    "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/35";
  const label = "block text-xs tracking-[0.16em] text-white/45 uppercase";
  const cta =
    "glow-soft rounded-full px-7 py-3.5 text-sm font-medium text-black/85 disabled:opacity-60";
  const ghost =
    "rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 hover:border-white/40";

  if (previewOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <BirthdayExperience
          gift={previewGift}
          preview
          onExit={() => setPreviewOpen(false)}
        />
        <button
          type="button"
          onClick={() => setPreviewOpen(false)}
          className="absolute bottom-4 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur"
          style={dir === "rtl" ? { left: 16 } : { right: 16 }}
        >
          <X className="h-3.5 w-3.5" /> {t("closePreview")}
        </button>
      </div>
    );
  }

  /* ---------- result screen ---------- */
  if (result) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/birthday/${result.id}`;
    const editUrl = `${origin}/edit/${result.id}?token=${result.token}`;
    return (
      <div dir={dir} className="surface-card animate-rise-in p-7 text-center">
        <div className="text-4xl">🎁</div>
        <h2 className="text-display mt-3 text-2xl text-white">{t("giftSaved")}</h2>

        <div className="mt-7 space-y-5 text-start">
          {[
            { title: t("publicLink"), hint: t("publicLinkHint"), url: publicUrl, key: "pub" },
            { title: t("privateLink"), hint: t("privateLinkHint"), url: editUrl, key: "priv" },
          ].map((row) => (
            <div key={row.key}>
              <p className={label}>{row.title}</p>
              <p className="mt-1 text-xs text-white/45">{row.hint}</p>
              <div className="mt-2 flex items-center gap-2">
                <input readOnly value={row.url} className={field + " flex-1 text-xs"} />
                <button
                  type="button"
                  onClick={() => copy(row.url, row.key)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white/70 hover:border-white/40"
                  aria-label={t("copyLink")}
                >
                  {copied === row.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <a
          href={publicUrl}
          className={cta + " mt-8 inline-block"}
          style={{ background: form.accentColor }}
        >
          {t("openGift")}
        </a>
      </div>
    );
  }

  /* ---------- editor form ---------- */
  return (
    <div dir={dir} className="flex flex-col gap-5">
      <Section title={t("secRecipient")}>
        <div>
          <label className={label} htmlFor="name">
            {t("theirName")}
          </label>
          <input
            id="name"
            value={form.recipientName}
            onChange={(e) => set("recipientName", e.target.value)}
            className={field + " mt-2"}
          />
        </div>
        <div>
          <label className={label} htmlFor="nick">
            {t("nickname")}
          </label>
          <input
            id="nick"
            value={form.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            className={field + " mt-2"}
          />
        </div>
        <div>
          <p className={label}>{t("giftLanguage")}</p>
          <div className="mt-2 flex gap-2">
            {(["en", "ar"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set("language", l)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                  form.language === l
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/15 text-white/60"
                }`}
              >
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">{t("giftLanguageHint")}</p>
        </div>
      </Section>

      <Section title={t("secWhen")}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="date">
              {t("date")}
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={field + " mt-2"}
            />
          </div>
          <div>
            <label className={label} htmlFor="time">
              {t("time")}
            </label>
            <input
              id="time"
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className={field + " mt-2"}
            />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="tz">
            {t("timeZone")}
          </label>
          <select
            id="tz"
            value={form.timeZone}
            onChange={(e) => set("timeZone", e.target.value)}
            className={field + " mt-2"}
          >
            {TIME_ZONES.map((tz) => (
              <option key={tz} value={tz} className="bg-[#141024]">
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-white/40">{t("whenHint")}</p>
      </Section>

      <Section title={t("secMessages")}>
        <div>
          <label className={label} htmlFor="main">
            {t("mainMessage")}
          </label>
          <textarea
            id="main"
            rows={6}
            value={form.mainMessage}
            onChange={(e) => set("mainMessage", e.target.value)}
            placeholder={t("mainMessagePh")}
            className={field + " mt-2 resize-y"}
          />
        </div>
        {form.extraMessages.map((m, i) => (
          <div key={i}>
            <label className={label}>{t("extraNote")}</label>
            <div className="mt-2 flex items-start gap-2">
              <textarea
                rows={2}
                value={m}
                onChange={(e) =>
                  set(
                    "extraMessages",
                    form.extraMessages.map((v, j) => (j === i ? e.target.value : v)),
                  )
                }
                className={field + " flex-1 resize-y"}
              />
              <button
                type="button"
                onClick={() => set("extraMessages", form.extraMessages.filter((_, j) => j !== i))}
                className="mt-1 text-white/40 hover:text-white"
                aria-label={t("remove")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("extraMessages", [...form.extraMessages, ""])}
          className={ghost + " w-fit"}
        >
          <Plus className="me-1 inline h-3.5 w-3.5" /> {t("addNote")}
        </button>
        <div>
          <label className={label} htmlFor="final">
            {t("finalMessage")}
          </label>
          <input
            id="final"
            value={form.finalMessage}
            onChange={(e) => set("finalMessage", e.target.value)}
            placeholder={t("finalMessagePh")}
            className={field + " mt-2"}
          />
        </div>
      </Section>

      <Section title={t("secMedia")}>
        <p className="text-xs text-white/40">{t("mediaHint")}</p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center transition-colors hover:border-white/40">
          <Plus className="h-5 w-5 text-white/50" />
          <span className="mt-2 text-sm text-white/70">
            {busy === "media" ? t("uploading") : t("addMedia")}
          </span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files, ["image", "video"], "media", e.target)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {form.media.map((m, i) => (
            <div key={m.url} className="group relative overflow-hidden rounded-xl border border-white/10">
              {m.type === "video" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={m.url} className="h-28 w-full bg-black object-cover" preload="metadata" />
              ) : (
                <img src={m.url} alt="" className="h-28 w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1.5">
                <span className="flex items-center gap-1 text-[10px] text-white/60">
                  <GripVertical className="h-3 w-3" />
                  {i + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    onClick={() => {
                      const next = [...form.media];
                      const [item] = next.splice(i, 1);
                      if (item) next.splice(i - 1, 0, item);
                      set("media", next);
                    }}
                    className="px-1 text-white/70 disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === form.media.length - 1}
                    aria-label={t("moveDown")}
                    onClick={() => {
                      const next = [...form.media];
                      const [item] = next.splice(i, 1);
                      if (item) next.splice(i + 1, 0, item);
                      set("media", next);
                    }}
                    className="px-1 text-white/70 disabled:opacity-25"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() => {
                      void removeGiftFile(m.path);
                      set("media", form.media.filter((_, j) => j !== i));
                    }}
                    className="px-1 text-white/70 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("secMusic")}>
        <p className="text-xs text-white/40">{t("musicHint")}</p>
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 hover:border-white/40">
          {busy === "music" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Music2 className="h-4 w-4" />
          )}
          {form.musicUrl ? t("replaceMusic") : t("addMusic")}
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files, ["audio"], "music", e.target)}
          />
        </label>

        {form.musicUrl && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="truncate text-sm text-white/70">{form.musicName || "audio"}</p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio src={form.musicUrl} controls preload="none" className="mt-3 w-full" />
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={form.musicEnabled}
                  onChange={(e) => set("musicEnabled", e.target.checked)}
                  className="h-4 w-4 accent-[var(--gold)]"
                />
                {t("playMusicInGift")}
              </label>
              <button
                type="button"
                onClick={() => {
                  void removeGiftFile(form.musicPath);
                  setForm((f) => ({
                    ...f,
                    musicUrl: null,
                    musicPath: null,
                    musicName: "",
                    musicEnabled: false,
                  }));
                }}
                className="text-sm text-white/45 hover:text-white"
              >
                {t("removeMusic")}
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title={t("secSurprise")}>
        <div>
          <label className={label} htmlFor="hidden">
            {t("hiddenMessage")}
          </label>
          <textarea
            id="hidden"
            rows={3}
            value={form.surpriseMessage}
            onChange={(e) => set("surpriseMessage", e.target.value)}
            placeholder={t("hiddenMessagePh")}
            className={field + " mt-2 resize-y"}
          />
        </div>
        <div>
          <p className={label}>{t("hiddenMedia")}</p>
          {form.surpriseMedia ? (
            <div className="mt-2 flex items-center gap-3">
              {form.surpriseMedia.type === "video" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={form.surpriseMedia.url}
                  className="h-20 w-28 rounded-lg bg-black object-cover"
                  preload="metadata"
                />
              ) : (
                <img
                  src={form.surpriseMedia.url}
                  alt=""
                  className="h-20 w-28 rounded-lg object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  void removeGiftFile(form.surpriseMedia?.path);
                  set("surpriseMedia", null);
                }}
                className="text-sm text-white/45 hover:text-white"
              >
                {t("remove")}
              </button>
            </div>
          ) : (
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 hover:border-white/40">
              {busy === "surprise" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("addMedia")}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) =>
                  void handleUpload(e.target.files, ["image", "video"], "surprise", e.target)
                }
              />
            </label>
          )}
        </div>
      </Section>

      <Section title={t("secAppearance")}>
        <div>
          <p className={label}>{t("theme")}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
              const th = THEMES[key];
              const active = form.theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, theme: key, accentColor: th.defaultAccent }))
                  }
                  className={`overflow-hidden rounded-xl border text-start transition-all ${
                    active ? "border-white/70 ring-1 ring-white/30" : "border-white/12"
                  }`}
                >
                  <span className="block h-14 w-full" style={{ background: th.celebration }} />
                  <span className="block px-3 py-2 text-xs text-white/75">
                    {uiLang === "ar" ? th.labelAr : th.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className={label}>{t("accent")}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => set("accentColor", a.value)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all ${
                  form.accentColor === a.value
                    ? "border-white/70 text-white"
                    : "border-white/12 text-white/60"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: a.value, boxShadow: `0 0 12px ${a.value}` }}
                />
                {uiLang === "ar" ? a.labelAr : a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={label}>{t("decorations")}</p>
          <p className="mt-1 text-xs text-white/40">{t("decorationsHint")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DECORATIONS.map((d) => {
              const active = form.decorations.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() =>
                    set(
                      "decorations",
                      active
                        ? form.decorations.filter((k) => k !== d.key)
                        : [...form.decorations, d.key],
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-xs transition-all ${
                    active ? "border-white/70 bg-white/10 text-white" : "border-white/12 text-white/55"
                  }`}
                >
                  <span aria-hidden>{d.icon}</span>{" "}
                  {uiLang === "ar" ? d.labelAr : d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* live appearance preview */}
        <div
          className="relative mt-2 h-32 overflow-hidden rounded-2xl border border-white/10"
          style={{ background: THEMES[form.theme].celebration }}
        >
          <div
            className="absolute inset-0"
            style={{ background: THEMES[form.theme].haze }}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-display text-glow text-2xl"
              style={{ color: form.accentColor, ["--gift-accent" as string]: form.accentColor }}
            >
              {form.recipientName || t("happyBirthday")}
            </span>
          </div>
        </div>
      </Section>

      <Section title={t("secPreview")}>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setPreviewSkip(false);
              setPreviewOpen(true);
            }}
            className={ghost}
          >
            {t("previewGift")}
          </button>
          <button
            type="button"
            onClick={() => {
              setPreviewSkip(true);
              setPreviewOpen(true);
            }}
            className={ghost}
          >
            {t("previewCelebration")}
          </button>
        </div>
      </Section>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={cta + " mt-2 self-start"}
        style={{ background: form.accentColor }}
      >
        {saving ? t("saving") : mode === "edit" ? t("saveChanges") : t("createGiftBtn")}
      </button>
    </div>
  );
}
