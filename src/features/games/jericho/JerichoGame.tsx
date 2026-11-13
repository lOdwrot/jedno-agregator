import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/ui";
import { StageOverlay } from "../components/StageOverlay";
import { higherIsBetter, useBestScore } from "../useBestScore";
import { useGameLoop } from "../useGameLoop";
import {
  BEAT,
  GOOD,
  LAPS,
  LEAD_IN,
  blow,
  createJericho,
  hitCount,
  accuracySoFar,
  hitRate,
  lapAt,
  startJericho,
  stepJericho,
  type JerichoState,
} from "./engine";
import { JerichoScene } from "./JerichoScene";
import { RhythmTrack } from "./RhythmTrack";
import { createSound, type JerichoSound } from "./sound";

const TAUNTS = [
  "Hej, orkiestra! Gracie na weselu?",
  "Chodzicie w kółko już siódmy dzień!",
  "Nasze mury są grubsze niż wasze nuty!",
  "Trąby z baranich rogów? Beee!",
  "Zgubiliście się? Brama jest tam!",
];
const KEYS = new Set([" ", "enter", "arrowup", "j", "f"]);

export function JerichoGame() {
  const [s, setS] = useState<JerichoState>(createJericho);
  const [record, setRecord] = useState(false);
  const [muted, setMuted] = useState(false);
  const sound = useRef<JerichoSound | null>(null);
  const lastBeat = useRef(-1);
  const stageRef = useRef<HTMLDivElement>(null);
  const best = useBestScore("mury-jerycha", higherIsBetter);
  const active = s.phase === "playing" || s.phase === "collapse";

  const sfx = (fn: (x: JerichoSound) => void) => {
    if (!muted && sound.current) fn(sound.current);
  };

  useGameLoop((dt) => {
    const n = stepJericho(s, dt);
    if (n.phase === "playing") {
      const beat = Math.floor(n.time / BEAT);
      if (beat !== lastBeat.current) {
        lastBeat.current = beat;
        sfx((x) => x.tick(beat % 4 === 0));
      }
    }
    const newMiss = n.notes.some(
      (note, i) => note.result === "miss" && s.notes[i]!.result !== "miss",
    );
    if (newMiss) sfx((x) => x.miss());
    if (n.phase === "collapse" && s.phase !== "collapse") sfx((x) => x.rumble());
    if (n.phase === "won" && s.phase !== "won") setRecord(best.submit(n.score));
    setS(n);
  }, active);

  const start = () => {
    sound.current ??= createSound();
    sound.current.unlock();
    lastBeat.current = -1;
    setS(startJericho());
    setRecord(false);
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const doBlow = () => {
    const n = blow(s);
    const hit = n.notes.find((note, i) => note.result !== s.notes[i]!.result);
    if (hit?.kind === "shout") sfx((x) => x.shout());
    else if (hit) sfx((x) => x.horn(hit.result === "perfect"));
    else if (n !== s) sfx((x) => x.miss());
    setS(n);
  };

  useEffect(() => {
    if (s.phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (!KEYS.has(e.key.toLowerCase()) || e.repeat) return;
      if (e.target instanceof Element && e.target.closest("input, select, textarea")) return;
      e.preventDefault();
      doBlow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const lap = lapAt(s.time);
  const countIn = s.phase === "playing" && s.time < LEAD_IN ? 4 - Math.floor(s.time / BEAT) : null;
  const shoutNear = s.notes.at(-1)!.result === null && s.notes.at(-1)!.t - s.time < 1.2;
  const fresh = s.feedback && s.time - s.feedback.at < 0.8 ? s.feedback : null;
  const done = s.phase === "won" || s.phase === "lost" || s.phase === "collapse";
  const accuracy = Math.round((done ? hitRate(s) : accuracySoFar(s)) * 100);
  const collapse = s.phase === "collapse" ? s.collapseT / 2.6 : s.phase === "won" ? 1 : 0;
  const cracks = Math.min(7, Math.floor(hitCount(s) / 6));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-navy">
        <p>
          Okrążenie: <span className="text-accent-ink">{Math.min(lap, LAPS)}</span> / {LAPS}
        </p>
        <p>
          Seria: {s.combo} · Celność: {accuracy}% · Punkty: {s.score}
        </p>
        <Button size="sm" variant="ghost" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
          {muted ? "🔇 Dźwięk wyłączony" : "🔊 Dźwięk włączony"}
        </Button>
      </div>

      {/* Game stage is a focusable keyboard target (role=application), like a canvas game. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-roledescription="gra"
        aria-label="Plansza gry Mury Jerycha. Naciśnij Spację albo stuknij planszę, gdy nuta jest w złotym kółku."
        className="relative overflow-hidden rounded-card bg-accent-soft shadow-card select-none"
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        <svg
          viewBox="0 0 800 460"
          className="block w-full touch-none"
          aria-hidden="true"
          onPointerDown={(e) => {
            if (s.phase !== "playing") return;
            e.preventDefault();
            doBlow();
          }}
        >
          <JerichoScene time={s.time} cracks={cracks} collapse={collapse} />
          <RhythmTrack s={s} />
        </svg>

        {s.phase === "playing" && (
          <p
            aria-hidden="true"
            className="absolute top-2 left-1/2 max-w-[70%] -translate-x-1/2 rounded-card border-2 border-navy bg-surface px-3 py-1 text-center text-[clamp(0.75rem,1.8vw,0.95rem)] font-bold text-navy shadow-card sm:top-4"
          >
            {TAUNTS[Math.floor(s.time / 4.5) % TAUNTS.length]}
          </p>
        )}
        {countIn !== null && (
          <p
            aria-hidden="true"
            className="absolute inset-x-0 top-1/3 text-center font-display text-6xl font-extrabold text-navy"
          >
            {countIn}
          </p>
        )}
        {fresh && s.phase === "playing" && (
          <p
            aria-hidden="true"
            className={cn(
              "absolute bottom-[22%] left-[4%] rounded-pill px-3 py-1 text-sm font-extrabold",
              fresh.kind === "perfect" || fresh.kind === "good"
                ? "bg-success text-white"
                : "bg-navy text-white",
            )}
          >
            {fresh.text}
          </p>
        )}

        {s.phase === "intro" && (
          <StageOverlay
            emoji="🎺🧱"
            title="Siódmy dzień pod Jerychem"
            actionLabel="Zaczynamy marsz!"
            onAction={start}
            footer={best.best !== null ? `Rekord: ${best.best} pkt` : undefined}
          >
            Trąb, gdy nuta wpadnie w złote kółko. Siedem okrążeń, a na końcu — wielki okrzyk! Gra ma
            dźwięk 🔊.
          </StageOverlay>
        )}
        {(s.phase === "won" || s.phase === "lost") && (
          <StageOverlay
            emoji={s.phase === "won" ? "🏆🧱" : "🙉"}
            title={s.phase === "won" ? "Mury runęły!" : "Mury jeszcze stoją…"}
            actionLabel="Jeszcze raz"
            onAction={start}
            footer={
              s.phase === "won"
                ? record
                  ? "Nowy rekord! 🎉"
                  : best.best !== null
                    ? `Rekord: ${best.best} pkt`
                    : undefined
                : undefined
            }
          >
            {s.phase === "won" ? (
              <>
                {s.score} pkt, celność {accuracy}%, najdłuższa seria {s.maxCombo}. Strażnicy właśnie
                zrozumieli, że to nie był koncert.
              </>
            ) : (
              <>
                Celność {accuracy}% — kapłani pogubili kroki. Spokojnie: Izraelici też musieli
                wytrwać aż siedem dni!
              </>
            )}
          </StageOverlay>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {s.phase === "playing" && lap >= 1 && lap <= LAPS
          ? `Okrążenie ${lap} z ${LAPS}`
          : s.phase === "playing" && lap > LAPS
            ? "Teraz okrzyk!"
            : (s.feedback?.text ?? "")}
      </p>

      <Button
        size="lg"
        fullWidth
        disabled={s.phase !== "playing"}
        onPointerDown={(e) => {
          e.preventDefault();
          doBlow();
        }}
        className={cn("min-h-16 text-xl", shoutNear && "bg-logo-red")}
      >
        {shoutNear ? "KRZYCZ! 📣" : "Trąb! 🎺"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Okno trafienia: ±{Math.round(GOOD * 1000)} ms. Na komputerze: Spacja, Enter, F lub J.
      </p>
    </div>
  );
}
