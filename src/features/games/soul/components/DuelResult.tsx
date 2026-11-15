import { Button, Dialog, Icon } from "@/ui";
import type { Discoveries } from "../collection/bestiary";
import type { PackType } from "../collection/packs";
import type { Opponent } from "../data/opponents";
import { RankMeter } from "../rank/RankMeter";
import { DuelDiscoveries } from "./DuelDiscoveries";

interface Props {
  won: boolean;
  reason: string;
  souls: number;
  earned: number;
  rank: { from: number; to: number };
  /** Victory booster already opened (and added to the collection). */
  prize: PackType | null;
  opponent: Opponent;
  /** Bestiary progress made in this duel. */
  found?: Discoveries;
  /** Practice duel: nothing was earned, so no talents line and no booster button. */
  training?: boolean;
  onBooster: () => void;
  onMenu: () => void;
}

/** End screen: result, talents earned, the lesson of the duel and a booster invitation. */
export function DuelResult({
  won,
  reason,
  souls,
  earned,
  rank,
  prize,
  opponent,
  found,
  training = false,
  onBooster,
  onMenu,
}: Props) {
  return (
    <Dialog
      open
      onClose={onMenu}
      title={won ? "🕊️ Dusze ocalone!" : "🔥 Tym razem pomioty górą"}
      size="sm"
    >
      <div className="flex flex-col gap-3 text-center">
        <p className="text-ink">{reason}</p>
        {!training && <RankMeter xp={rank.to} from={rank.from} />}
        {training ? (
          <p className="font-bold text-navy">
            🎯 Trening — bez nagród{" "}
            <span className="font-normal text-ink-muted">(ocalone dusze: {souls})</span>
          </p>
        ) : (
          <p className="font-bold text-navy">
            +{earned} talentów{" "}
            <span className="font-normal text-ink-muted">(ocalone dusze: {souls})</span>
          </p>
        )}
        {prize && (
          <p className="text-sm text-ink">
            {prize.emoji} Nagroda za zwycięstwo: booster <strong>{prize.name}</strong> — karty są
            już w Twojej kolekcji.
          </p>
        )}
        {found && <DuelDiscoveries found={found} />}
        <p className="rounded-card bg-accent-soft p-3 text-left text-sm text-ink">
          <strong className="text-accent-ink">Na drogę:</strong> {opponent.moral}
        </p>
        {training && won && (
          <p className="text-sm text-ink-muted">
            Skoro dajesz radę na treningu — zapłać wpisowe i zawalcz o talenty i booster.
          </p>
        )}
        {!won && !training && (
          <p className="text-sm text-ink-muted">
            Nie przejmuj się — święci też przegrywali bitwy. Otwórz booster, wzmocnij talię i
            spróbuj jeszcze raz.
          </p>
        )}
        {!training && (
          <Button size="lg" onClick={onBooster} leftIcon={<Icon name="sparkle" size={18} />}>
            Otwórz booster
          </Button>
        )}
        <Button variant="ghost" onClick={onMenu}>
          Wróć do menu
        </Button>
      </div>
    </Dialog>
  );
}
