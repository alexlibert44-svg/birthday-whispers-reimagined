import { createFileRoute, Link } from "@tanstack/react-router";

import { GiftEditor } from "@/components/editor/GiftEditor";
import { LANGS, useAppLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a birthday gift — Lumière" },
      {
        name: "description",
        content:
          "Build a cinematic birthday page with messages, photos, videos and music. No account needed.",
      },
      { property: "og:title", content: "Create a birthday gift — Lumière" },
      {
        property: "og:description",
        content: "Build a cinematic birthday page with messages, photos, videos and music.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const { lang, setLang, t, dir } = useAppLanguage();

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

        <h1 className="text-display mt-5 text-3xl text-white sm:text-4xl">{t("editorTitle")}</h1>
        <p className="mt-2 text-sm text-white/50">{t("editorSub")}</p>

        <div className="mt-8">
          <GiftEditor mode="create" uiLang={lang} />
        </div>
      </div>
    </div>
  );
}
