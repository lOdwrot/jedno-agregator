import { Button } from "@/ui";
import { useMuted } from "../audio/mute";

/** One sound switch for all games (remembered on this device). */
export function SoundToggle() {
  const [muted, setMuted] = useMuted();
  return (
    <Button size="sm" variant="soft" onClick={() => setMuted(!muted)}>
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
      Dźwięk {muted ? "wyłączony" : "włączony"}
    </Button>
  );
}
