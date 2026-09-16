import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Music2, VolumeX } from "lucide-react";

import { Balloons, FloatingMotes, Sparkles, Starfield } from "./Ambience";
import { Confetti } from "./Confetti";
import { CakeSVG, GiftBoxSVG } from "./Decor";
import { playCelebrationChime, playPop, playTick } from "@/lib/sfx";
import { dirOf, translator } from "@/lib/i18n";
import { THEMES, type GiftConfig, type MediaItem } from "@/lib/gift";

type Phase = "intro" | "waiting" | "celebration" | "message" | "memories" | "surprise" | "final";

function remaining(target: string) {
  const ms = new Date(target).getTime() - Date.now();
  const clamped = Math.max(0, ms);
  return {
    ms,
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamped % 3_600_000) / 60_000),
    seconds: Math.floor((clamped % 60_000) / 1000),
  };
}

export function BirthdayExperience({
  gift,
  onUnlock,
  preview = false,
  onExit,
}: {
  gift: GiftConfig;
  onUnlock?: () => void;
  preview?: boolean;
  onExit?: () => void;
}) {
  const t = translator(gift.language);
  const dir = dirOf(gift.language);
  const theme = THEMES[gift.theme] ?? THEMES.midnight;
  const accent = gift.accentColor || theme.defaultAccent;
  const frameColor = gift.messageFrameColor || accent;
  const has = (key: string) => gift.decorations.includes(key as never);

  const [phase, setPhase] = useState<Phase>("intro");
  const [left, setLeft] = useState(() => remaining(gift.celebrateAt));
  const [burst, setBurst] = useState(0);
  const [index, setIndex] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [boxOpen, setBoxOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [needsMusicTap, setNeedsMusicTap] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const unlockedRef = useRef(false);

  const musicAvailable = gift.musicEnabled && !!gift.musicUrl;
  const celebrating =
    phase === "celebration" ||
    phase === "message" ||
    phase === "memories" ||
    phase === "surprise" ||
    phase === "final";

  /* ---------------- countdown ---------------- */
  useEffect(() => {
    if (phase !== "waiting") return;
    const id = window.setInterval(() => {
      const next = remaining(gift.celebrateAt);
      setLeft(next);
      if (next.ms <= 0 && !unlockedRef.current) {
        unlockedRef.current = true;
        onUnlock?.();
        startCelebration();
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, gift.celebrateAt]);

  /* ---------------- music: celebration only ---------------- */
  const startMusic = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !musicAvailable) return;
    try {
      el.volume = 0.6;
      el.loop = true;
      await el.play();
      setMusicPlaying(true);
      setNeedsMusicTap(false);
    } catch {
      // Autoplay blocked — offer an explicit button instead of failing.
      setMusicPlaying(false);
      setNeedsMusicTap(true);
    }
  }, [musicAvailable]);

  const toggleMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      el.pause();
      setMusicPlaying(false);
    } else {
      void startMusic();
    }
  }, [musicPlaying, startMusic]);

  // Music must never survive into a non-celebration phase.
  useEffect(() => {
    if (celebrating) return;
    const el = audioRef.current;
    if (el && !el.paused) el.pause();
    setMusicPlaying(false);
    setNeedsMusicTap(false);
  }, [celebrating]);

  const startCelebration = useCallback(() => {
    setPhase("celebration");
    setBurst((b) => b + 1);
    playCelebrationChime();
    void startMusic();
  }, [startMusic]);

  const begin = useCallback(() => {
    const ready = preview || remaining(gift.celebrateAt).ms <= 0;
    if (ready) startCelebration();
    else setPhase("waiting"); // no music here, by design
  }, [preview, gift.celebrateAt, startCelebration]);

  /* ---------------- media ---------------- */
  const media = gift.media;
  const current: MediaItem | undefined = media[index];

  const pauseAllVideos = useCallback(() => {
    videoRefs.current.forEach((v) => {
      if (v && !v.paused) v.pause();
    });
  }, []);

  const go = useCallback(
    (delta: number) => {
      pauseAllVideos();
      playTick();
      setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(media.length - 1, 0)));
    },
    [media.length, pauseAllVideos],
  );

  const restart = () => {
    pauseAllVideos();
    setIndex(0);
    setMsgIndex(0);
    setBoxOpen(false);
    setPhase("intro");
  };

  /* ---------------- personal messages, one per screen ---------------- */
  const messages = useMemo(
    () => [gift.mainMessage, ...gift.extraMessages].filter((m) => m && m.trim()),
    [gift.mainMessage, gift.extraMessages],
  );

  const afterMessages = useCallback(() => {
    if (media.length) return "memories" as const;
    if (gift.surpriseMessage || gift.surpriseMedia) return "surprise" as const;
    return "final" as const;
  }, [media.length, gift.surpriseMessage, gift.surpriseMedia]);

  const goMessage = useCallback(
    (delta: number) => {
      const next = msgIndex + delta;
      if (next < 0) return;
      if (next >= messages.length) {
        playTick();
        setPhase(afterMessages());
        return;
      }
      playTick();
      setMsgIndex(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [msgIndex, messages.length, afterMessages],
  );

  const touchX = useRef<number | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchX.current;
      touchX.current = null;
      const end = e.changedTouches[0]?.clientX;
      if (start == null || end == null) return;
      const dx = end - start;
      if (Math.abs(dx) < 50) return;
      // Swiping left moves forward in LTR, backwards in RTL.
      const forward = dir === "rtl" ? dx > 0 : dx < 0;
      goMessage(forward ? 1 : -1);
    },
    [dir, goMessage],
  );

  /* ---------------- shell ---------------- */
  const background = celebrating ? theme.celebration : theme.background;
  const styleVars = useMemo(
    () =>
      ({
        background,
        ["--gift-accent" as string]: accent,
        ["--gift-glow" as string]: theme.glow,
        ["--message-frame-color" as string]: frameColor,
      }) as React.CSSProperties,
    [background, accent, frameColor, theme.glow],
  );

  const btn =
    "glow-soft rounded-full px-7 py-3.5 text-sm font-medium text-black/85 transition-transform active:scale-95";
  const ghost =
    "rounded-full border border-white/20 px-6 py-3 text-sm text-white/75 transition-colors hover:border-white/45";

  return (
    <div
      dir={dir}
      lang={gift.language}
      className="relative min-h-[100svh] overflow-x-hidden transition-[background] duration-1000"
      style={styleVars}
    >
      {/* ambience */}
      {has("stars") && <Starfield density={celebrating ? 60 : 38} color={theme.star} />}
      <div className="pointer-events-none absolute inset-0" style={{ background: theme.haze }} />
      {!celebrating && <FloatingMotes count={10} />}
      {celebrating && has("balloons") && <Balloons count={14} colors={theme.balloons} />}
      {celebrating && has("sparkles") && (
        <Sparkles count={22} colors={[accent, "#ffffff", theme.glow]} />
      )}
      {celebrating && has("confetti") && (
        <Confetti burstKey={burst} continuous colors={theme.confetti} intensity={1} />
      )}

      {/* exit */}
      <button
        type="button"
        onClick={() => (onExit ? onExit() : window.history.length > 1 ? window.history.back() : (window.location.href = "/"))}
        className="absolute top-4 z-30 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-xs text-white/70 backdrop-blur transition-colors hover:text-white"
        style={dir === "rtl" ? { right: 16 } : { left: 16 }}
      >
        {dir === "rtl" ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        {t("exit")}
      </button>

      {/* music control */}
      {musicAvailable && celebrating && (
        <div
          className="absolute top-4 z-30 flex items-center gap-2"
          style={dir === "rtl" ? { left: 16 } : { right: 16 }}
        >
          {needsMusicTap ? (
            <button
              type="button"
              onClick={() => void startMusic()}
              className="animate-pulse-glow flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-black/85"
              style={{ background: accent }}
            >
              <Music2 className="h-3.5 w-3.5" /> {t("playMusic")}
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={musicPlaying ? t("musicOn") : t("musicOff")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition-colors hover:text-white"
            >
              {musicPlaying ? <Music2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}

      {musicAvailable && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={audioRef} src={gift.musicUrl ?? undefined} preload="none" loop />
      )}

      {preview && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <button type="button" onClick={restart} className={ghost + " bg-black/30 backdrop-blur"}>
            {t("restart")}
          </button>
        </div>
      )}

      {/* ---------------- phases ---------------- */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col items-center justify-center px-6 pt-24 pb-28 text-center">
        {phase === "intro" && (
          <div className="animate-rise-in">
            {has("giftbox") && (
              <GiftBoxSVG size={150} accent={accent} className="mx-auto animate-pulse-glow" />
            )}
            <h1 className="text-display mt-6 text-3xl leading-tight text-white sm:text-4xl">
              {t("expIntroTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/55">{t("expIntroSub")}</p>
            <button type="button" onClick={begin} className={btn + " mt-9"} style={{ background: accent }}>
              {t("begin")}
            </button>
          </div>
        )}

        {phase === "waiting" && (
          <div className="animate-rise-in w-full">
            <h2 className="text-display text-2xl text-white sm:text-3xl">{t("waitingTitle")}</h2>
            <p className="mt-3 text-sm text-white/50">{t("waitingSub")}</p>
            <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-4" dir="ltr">
              {[
                [left.days, t("days")],
                [left.hours, t("hours")],
                [left.minutes, t("mins")],
                [left.seconds, t("secs")],
              ].map(([value, label], i) => (
                <div key={i} className="surface-card px-2 py-5">
                  <div
                    className="text-display text-3xl sm:text-4xl"
                    style={{ color: accent }}
                  >
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.18em] text-white/40 uppercase">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            {preview && (
              <button type="button" onClick={startCelebration} className={ghost + " mt-8"}>
                {t("skipCountdown")}
              </button>
            )}
          </div>
        )}

        {phase === "celebration" && (
          <div className="animate-pop-in">
            {has("cake") && <CakeSVG size={190} accent={accent} className="mx-auto" />}
            <p className="mt-6 text-xs tracking-[0.3em] text-white/50 uppercase">
              {t("happyBirthday")}
            </p>
            <h1
              className="text-display text-glow mt-3 text-5xl leading-[1.05] sm:text-7xl"
              style={{ color: accent }}
            >
              {gift.nickname || gift.recipientName}
            </h1>
            <button
              type="button"
              onClick={() => {
                setBurst((b) => b + 1);
                setMsgIndex(0);
                setPhase("message");
              }}
              className={btn + " mt-10"}
              style={{ background: accent }}
            >
              {t("readMessage")}
            </button>
          </div>
        )}

        {phase === "message" && (
          <div
            key={msgIndex}
            className="animate-rise-in w-full"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <p className="text-xs tracking-[0.3em] text-white/45 uppercase">{t("dear")}</p>
            <h2 className="text-display mt-2 text-3xl text-white sm:text-4xl">
              {gift.recipientName}
            </h2>

            {/* one message per screen, inside its own frame */}
            <div
              className={`gift-message-frame message-frame--${gift.messageFrameStyle} mt-6 w-full overflow-hidden p-5 sm:p-7`}
            >
              <div className="max-h-[48svh] overflow-x-hidden overflow-y-auto overscroll-contain">
                <p
                  className={`text-base leading-relaxed break-words whitespace-pre-line text-white sm:text-lg ${
                    msgIndex === 0 ? "" : "italic"
                  }`}
                >
                  {messages[msgIndex]}
                </p>
              </div>
            </div>

            {messages.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-4" dir="ltr">
                <button
                  type="button"
                  onClick={() => goMessage(-1)}
                  disabled={msgIndex === 0}
                  aria-label={t("previous")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs tracking-[0.2em] text-white/55">
                  {msgIndex + 1} / {messages.length}
                </span>
                <button
                  type="button"
                  onClick={() => goMessage(1)}
                  aria-label={t("next")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => goMessage(1)}
              className={btn + " mt-7"}
              style={{ background: accent }}
            >
              {msgIndex < messages.length - 1
                ? t("next")
                : media.length
                  ? t("seeMemories")
                  : t("continueBtn")}
            </button>
          </div>
        )}

        {phase === "memories" && current && (
          <div className="w-full">
            <p className="text-xs tracking-[0.3em] text-white/45 uppercase">{t("memories")}</p>
            <div className="mt-5 flex w-full justify-center">
              {current.type === "video" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  key={current.url}
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={current.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="gift-media-frame max-h-[62svh] max-w-full object-contain p-1.5"
                />
              ) : (
                <img
                  key={current.url}
                  src={current.url}
                  alt={current.caption || `${t("memories")} ${index + 1}`}
                  loading="lazy"
                  className="gift-media-frame h-auto max-h-[62svh] w-auto max-w-full object-contain p-1.5"
                />
              )}
            </div>
            {current.caption && <p className="mt-3 text-sm text-white/60">{current.caption}</p>}

            <div className="mt-5 flex items-center justify-center gap-3" dir="ltr">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label={t("previous")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {media.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full transition-all"
                    style={{
                      background: i === index ? accent : "rgba(255,255,255,0.25)",
                      width: i === index ? 18 : 6,
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index >= media.length - 1}
                aria-label={t("next")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                pauseAllVideos();
                setPhase(gift.surpriseMessage || gift.surpriseMedia ? "surprise" : "final");
              }}
              className={btn + " mt-8"}
              style={{ background: accent }}
            >
              {t("continueBtn")}
            </button>
          </div>
        )}

        {phase === "surprise" && (
          <div className="animate-rise-in w-full">
            <p className="text-xs tracking-[0.3em] text-white/45 uppercase">{t("surpriseTitle")}</p>
            <button
              type="button"
              onClick={() => {
                if (!boxOpen) {
                  playPop();
                  setBurst((b) => b + 1);
                }
                setBoxOpen(true);
              }}
              className="mx-auto mt-6 block"
              aria-label={t("tapToOpen")}
            >
              <GiftBoxSVG
                size={170}
                accent={accent}
                open={boxOpen}
                className={boxOpen ? "" : "animate-pulse-glow"}
              />
            </button>
            {!boxOpen && <p className="mt-3 text-sm text-white/50">{t("tapToOpen")}</p>}

            {boxOpen && (
              <div className="animate-rise-in mt-6">
                {gift.surpriseMessage && (
                  <p className="text-base leading-relaxed whitespace-pre-line text-white/85">
                    {gift.surpriseMessage}
                  </p>
                )}
                {gift.surpriseMedia && (
                  <div className="mt-5 flex w-full justify-center">
                    {gift.surpriseMedia.type === "video" ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={gift.surpriseMedia.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="gift-media-frame max-h-[55svh] max-w-full object-contain p-1.5"
                      />
                    ) : (
                      <img
                        src={gift.surpriseMedia.url}
                        alt={gift.surpriseMedia.caption || t("surpriseTitle")}
                        className="gift-media-frame h-auto max-h-[55svh] w-auto max-w-full object-contain p-1.5"
                      />
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPhase("final")}
                  className={btn + " mt-8"}
                  style={{ background: accent }}
                >
                  {t("continueBtn")}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "final" && (
          <div className="animate-rise-in">
            <p className="text-xs tracking-[0.3em] text-white/45 uppercase">{t("lastMoment")}</p>
            <h2
              className="text-display text-glow mt-4 text-4xl leading-tight sm:text-5xl"
              style={{ color: accent }}
            >
              {t("happyBirthday")}, {gift.nickname || gift.recipientName}
            </h2>
            {gift.finalMessage && (
              <p className="mt-6 text-base leading-relaxed whitespace-pre-line text-white/75">
                {gift.finalMessage}
              </p>
            )}
            {has("cake") && <CakeSVG size={130} accent={accent} className="mx-auto mt-8 opacity-90" />}
            <button type="button" onClick={restart} className={ghost + " mt-9"}>
              {t("watchAgain")}
            </button>
          </div>
        )}
      </div>

      {preview && (
        <span className="pointer-events-none absolute bottom-4 z-30 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] tracking-[0.2em] text-white/50 uppercase"
          style={dir === "rtl" ? { right: 16 } : { left: 16 }}
        >
          {t("preview")}
        </span>
      )}
    </div>
  );
}
