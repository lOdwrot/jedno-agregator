import { Button, Dialog, Icon } from "@/ui";
import type { Opponent } from "../data/opponents";

interface Props {
  won: boolean;
  reason: string;
  souls: number;
  earned: number;
  opponent: Opponent;
  onBooster: () => void;
  onMenu: () => void;
}

/** End screen: result, talents earned, the lesson of the duel and a booster invitation. */
export function DuelResult({ won, reason, souls, earned, opponent, onBooster, onMenu }: Props) {
  return (
    <Dialog
      open
      onClose={onMenu}
      title={won ? "🕊️ Dusze ocalone!" : "🔥 Tym razem pomioty górą"}
      size="sm"
    >
      <div className="flex flex-col gap-3 text-center">
        <p className="text-ink">{reason}</p>
        <p className="font-bold text-navy">
          +{earned} talentów{" "}
          <span className="font-normal text-ink-muted">(ocalone dusze: {souls})</span>
        </p>
        <p className="rounded-card bg-accent-soft p-3 text-left text-sm text-ink">
          <strong className="text-accent-ink">Na drogę:</strong> {opponent.moral}
        </p>
        {!won && (
          <p className="text-sm text-ink-muted">
            Nie przejmuj się — święci też przegrywali bitwy. Otwórz booster, wzmocnij talię i
            spróbuj jeszcze raz.
          </p>
        )}
        <Button size="lg" onClick={onBooster} leftIcon={<Icon name="sparkle" size={18} />}>
          Otwórz booster
        </Button>
        <Button variant="ghost" onClick={onMenu}>
          Wróć do menu
        </Button>
      </div>
    </Dialog>
  );
}
