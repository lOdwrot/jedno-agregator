import { useState } from "react";
import { Switch } from "@/ui";
import { loadPrefs, savePrefs, type AudioPrefs } from "../audio/context";
import { canVibrate, useHaptics } from "../audio/haptics";
import { useCardArt } from "../data/artPref";
import { useMuted } from "../../audio/mute";

/** "Ustawienia" tab of the hub: sound effects, music, vibrations and card pictures (all remembered on this device). */
export function Settings() {
  const [prefs, setPrefs] = useState<AudioPrefs>(loadPrefs);
  const [haptics, setHaptics] = useHaptics();
  const [cardArt, setCardArt] = useCardArt();
  // the page's "Dźwięk" button switches the same sound effects — follow it
  const [muted] = useMuted();
  const set = (k: keyof AudioPrefs) => (v: boolean) => {
    const next = { ...prefs, sfx: !muted, [k]: v };
    setPrefs(next);
    savePrefs(next);
  };
  const vibrates = canVibrate();
  return (
    <section
      aria-labelledby="soul-settings"
      className="flex max-w-xl flex-col gap-2 rounded-card bg-surface p-5 shadow-card"
    >
      <h3 id="soul-settings" className="font-display text-lg font-extrabold text-navy">
        Ustawienia
      </h3>
      <p className="text-sm text-ink-muted">Zapamiętujemy je na tym urządzeniu.</p>
      <Switch
        checked={!muted}
        onChange={set("sfx")}
        label="🔊 Efekty dźwiękowe"
        description="Ataki, zagrania kart, moneta."
      />
      <Switch
        checked={prefs.music}
        onChange={set("music")}
        label="🎵 Muzyka w tle"
        description="Gra podczas pojedynku."
      />
      <Switch
        checked={cardArt}
        onChange={setCardArt}
        label="🖼️ Ilustracje kart"
        description="Rysunki na kartach. Wyłączone — karty pokazują emoji jak dawniej."
      />
      <Switch
        checked={haptics}
        onChange={setHaptics}
        label="📳 Wibracje (haptyka)"
        description={
          vibrates
            ? "Telefon drga, gdy kładziesz kartę na stół, przy ataku i trafieniu."
            : "To urządzenie nie obsługuje wibracji w przeglądarce (np. iPhone, komputer)."
        }
      />
    </section>
  );
}
