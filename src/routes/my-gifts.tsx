import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Eye, Pencil, X } from "lucide-react";

import { BirthdayExperience } from "@/components/experience/BirthdayExperience";
import { getGiftForEdit, listMyGifts } from "@/lib/gifts.functions";
import { getOwnerKey } from "@/lib/owner";
import { LANGS, useAppLanguage } from "@/lib/i18n";
import type { GiftConfig } from "@/lib/gift";

export const Route = createFileRoute("/my-gifts")({
  head: () => ({
    meta: [
      { title: "My Gifts — Lumière" },
      {
        name: "description",
        content: "Open, preview, edit and share the birthday gifts you created.",
      },
      { property: "og:title", content: "My Gifts — Lumière" },
      {
        property: "og:description",
        content: "Open, preview, edit and share the birthday gifts you created.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyGiftsPage,
});

function MyGiftsPage() {
  const { lang, setLang, t, dir } = useAppLanguage();
  const [ownerKey, setOwnerKey] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [previewGift, setPreviewGift] = useState<GiftConfig | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    setOwnerKey(getOwnerKey());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["my-gifts", ownerKey],
    enabled: !!ownerKey,
    queryFn: () => listMyGifts({ data: { ownerKey } }),
  });

  const copy = async (id: string) => {
    const url = `${window.location.origin}/birthday/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(id);
    toast.success(t("copied"));
    window.setTimeout(() => setCopied(null), 1800);
  };

  const openPreview = async (id: string) => {
    setPreviewing(id);
    try {
      const gift = await getGiftForEdit({ data: { giftId: id, ownerKey } });
      if (!gift) throw new Error(t("errLoad"));
      setPreviewGift(gift);
    } catch {
      toast.error(t("errLoad"));
    } finally {
      setPreviewing(null);
    }
  };

  if (previewGift) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <BirthdayExperience gift={previewGift} preview onExit={() => setPreviewGift(null)} />
        <button
          type="button"
          onClick={() => setPreviewGift(null)}
          className="absolute bottom-4 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs text-white/80 backdrop-blur"
          style={dir === "rtl" ? { left: 16 } : { right: 16 }}
        >
          <X className="h-3.5 w-3.5" /> {t("closePreview")}
        </button>
      </div>
    );
  }

  const action =
    "flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-white/75 transition-colors hover:border-white/40";

  return (
    <div dir={dir} className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-xs tracking-[0.2em] text-white/40 uppercase">
            {dir === "rtl" ? "→" : "←"} {t("back")}
          </Link>
          <div className="flex gap-1 rounded-full border border-white/12 p-1">
            {LANGS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLang(l.value)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  lang === l.value ? "bg-white/12 text-white" : "text-white/50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-display mt-5 text-3xl text-white sm:text-4xl">{t("myGifts")}</h1>
        <p className="mt-2 text-sm text-white/50">{t("myGiftsSub")}</p>

        <div className="mt-8 flex flex-col gap-3">
          {isLoading && <p className="text-sm text-white/45">{t("loadingTxt")}</p>}
          {!isLoading && (!data || data.length === 0) && (
            <div className="surface-card p-6 text-center">
              <p className="text-sm text-white/55">{t("myGiftsEmpty")}</p>
              <Link
                to="/create"
                className="mt-4 inline-block rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 hover:border-white/50"
              >
                {t("createGift")}
              </Link>
            </div>
          )}

          {data?.map((g) => (
            <div key={g.id} className="surface-card p-5">
              <p className="text-display text-lg text-white">🎁 {g.recipientName}</p>
              <p className="mt-1 text-xs text-white/40">
                {t("birthdayOn")}: {new Date(g.celebrateAt).toLocaleString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/birthday/$giftId" params={{ giftId: g.id }} className={action}>
                  {t("openGift")}
                </Link>
                <button
                  type="button"
                  onClick={() => void openPreview(g.id)}
                  disabled={previewing === g.id}
                  className={action + " disabled:opacity-50"}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {previewing === g.id ? t("loadingTxt") : t("previewGift")}
                </button>
                <Link
                  to="/edit/$giftId"
                  params={{ giftId: g.id }}
                  search={{ token: undefined }}
                  className={action}
                >
                  <Pencil className="h-3.5 w-3.5" /> {t("editGift")}
                </Link>
                <button type="button" onClick={() => void copy(g.id)} className={action}>
                  {copied === g.id ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {t("copyLink")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
