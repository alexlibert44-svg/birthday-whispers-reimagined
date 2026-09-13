import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Gift, Sparkles as SparklesIcon } from "lucide-react";

import { Balloons, FloatingMotes, Sparkles, Starfield } from "@/components/experience/Ambience";
import { CakeSVG } from "@/components/experience/Decor";
import { THEMES } from "@/lib/gift";
import { LANGS, useAppLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumière — Cinematic birthday gifts you can share" },
      {
        name: "description",
        content:
          "Create a personalised birthday page with messages, photos, videos and music. It stays locked until the exact moment. No account needed.",
      },
      { property: "og:title", content: "Lumière — Cinematic birthday gifts you can share" },
      {
        property: "og:description",
        content:
          "Create a personalised birthday page that unlocks at the exact birthday moment. No account needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

type SavedGift = { id: string; token: string; name: string; at: number };

function Landing() {
  const { lang, setLang, t, dir } = useAppLanguage();
  const theme = THEMES.midnight;
  const [mine, setMine] = useState<SavedGift[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lumiere.mygifts");
      if (raw) setMine(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const features = [
    { icon: Clock, title: t("f1Title"), body: t("f1Body") },
    { icon: SparklesIcon, title: t("f2Title"), body: t("f2Body") },
    { icon: Gift, title: t("f3Title"), body: t("f3Body") },
  ];

  return (
    <div
      dir={dir}
      className="relative min-h-[100svh] overflow-hidden"
      style={{
        background: theme.celebration,
        ["--gift-accent" as string]: theme.defaultAccent,
      }}
    >
      <Starfield density={50} color={theme.star} />
      <div className="pointer-events-none absolute inset-0" style={{ background: theme.haze }} />
      <Balloons count={8} colors={theme.balloons} />
      <FloatingMotes count={10} />
      <Sparkles count={14} colors={[theme.defaultAccent, "#ffffff"]} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-8">
        <header className="flex items-center justify-between">
          <span className="text-xs tracking-[0.3em] text-white/55 uppercase">{t("brand")}</span>
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
        </header>

        <main className="flex flex-col items-center pt-14 pb-20 text-center">
          <CakeSVG size={170} accent={theme.defaultAccent} className="animate-rise-in" />
          <h1 className="text-display animate-rise-in mt-8 max-w-2xl text-4xl leading-[1.1] text-white sm:text-6xl">
            {t("landingTitle")}
          </h1>
          <p className="animate-rise-in mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {t("landingSub")}
          </p>

          <Link
            to="/create"
            className="glow-soft animate-pulse-glow mt-9 rounded-full px-8 py-4 text-sm font-medium text-black/85"
            style={{ background: theme.defaultAccent }}
          >
            {t("createGift")}
          </Link>
          <p className="mt-3 text-xs tracking-[0.2em] text-white/40 uppercase">{t("noAccount")}</p>

          <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="surface-card p-6 text-start">
                <f.icon className="h-5 w-5" style={{ color: theme.defaultAccent }} />
                <h2 className="text-display mt-3 text-lg text-white">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
              </div>
            ))}
          </div>

          {mine.length > 0 && (
            <div className="mt-14 w-full text-start">
              <p className="text-xs tracking-[0.2em] text-white/40 uppercase">{t("privateLink")}</p>
              <div className="mt-3 flex flex-col gap-2">
                {mine.map((g) => (
                  <div
                    key={g.id}
                    className="surface-card flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <span className="text-sm text-white/80">🎁 {g.name}</span>
                    <div className="flex gap-2 text-xs">
                      <Link
                        to="/birthday/$giftId"
                        params={{ giftId: g.id }}
                        className="rounded-full border border-white/15 px-4 py-2 text-white/70 hover:border-white/40"
                      >
                        {t("openGift")}
                      </Link>
                      <Link
                        to="/edit/$giftId"
                        params={{ giftId: g.id }}
                        search={{ token: g.token }}
                        className="rounded-full border border-white/15 px-4 py-2 text-white/70 hover:border-white/40"
                      >
                        {t("saveChanges")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
