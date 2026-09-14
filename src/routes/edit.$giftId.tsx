import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { GiftEditor } from "@/components/editor/GiftEditor";
import { getGiftForEdit } from "@/lib/gifts.functions";
import { getOwnerKey } from "@/lib/owner";
import { LANGS, useAppLanguage } from "@/lib/i18n";

type Search = { token?: string | undefined };

export const Route = createFileRoute("/edit/$giftId")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Edit your birthday gift — Lumière" },
      { name: "description", content: "Update the birthday gift you created." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Edit your birthday gift — Lumière" },
      { property: "og:description", content: "Update the birthday gift you created." },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { giftId } = Route.useParams();
  const { token } = Route.useSearch();
  const { lang, setLang, t, dir } = useAppLanguage();
  const [ownerKey, setOwnerKey] = useState("");

  useEffect(() => {
    setOwnerKey(getOwnerKey());
  }, []);

  const ready = !!token || !!ownerKey;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gift-edit", giftId, token, ownerKey],
    enabled: ready,
    retry: false,
    queryFn: () => getGiftForEdit({ data: { giftId, ...(token ? { token } : {}), ownerKey } }),
  });

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

        <h1 className="text-display mt-5 text-3xl text-white sm:text-4xl">{t("editTitle")}</h1>

        <div className="mt-8">
          {!token && <p className="text-sm text-white/50">{t("errLoad")}</p>}
          {token && isLoading && <p className="text-sm text-white/45">…</p>}
          {token && !isLoading && (isError || !data) && (
            <p className="text-sm text-white/50">{t("errLoad")}</p>
          )}
          {data && <GiftEditor mode="edit" gift={data} token={token} uiLang={lang} />}
        </div>
      </div>
    </div>
  );
}
