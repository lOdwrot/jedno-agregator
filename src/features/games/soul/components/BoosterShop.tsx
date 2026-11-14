import { useRef, useState } from "react";
import { Badge, Button, Heading, Icon } from "@/ui";
import { PACKS, rollPack, type PackType } from "../collection/packs";
import {
  canOpenBooster,
  openBooster,
  owned,
  type CardKey,
  type Profile,
} from "../collection/profile";
import { BoosterOpening } from "./BoosterOpening";
import { BoosterPack } from "./BoosterPack";

interface Opening {
  pack: PackType;
  cards: CardKey[];
  fresh: boolean[];
  key: number;
}

/** Three booster editions to choose from; opening one plays the full-screen animation. */
export function BoosterShop({
  profile,
  update,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
}) {
  const [opening, setOpening] = useState<Opening | null>(null);
  const seq = useRef(0);

  const open = (pack: PackType, p: Profile = profile) => {
    if (!canOpenBooster(p, pack.price)) return;
    const cards = rollPack(pack);
    const seen = new Set<CardKey>();
    const fresh = cards.map((k) => {
      const isNew = owned(p, k) === 0 && !seen.has(k);
      seen.add(k);
      return isNew;
    });
    update((x) => openBooster(x, cards, pack.price));
    setOpening({ pack, cards, fresh, key: ++seq.current });
  };

  const why = (pack: PackType) =>
    profile.packs <= 0
      ? "Rozegraj pojedynek, żeby zdobyć kolejny booster."
      : profile.talents < pack.price
        ? `Brakuje ${pack.price - profile.talents} talentów.`
        : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-surface p-4 shadow-card">
        <Heading level={3} size="sm">
          Wybierz paczkę
        </Heading>
        <p className="mt-1 text-sm text-ink-muted">
          Każda paczka ma 5 kart: 3 pospolite, 1 niepospolitą i 1 rzadką lub legendarną. Karty mogą
          trafić się w wersji złoconej ✦ (+10 ♥) albo witrażowej ❖ (+20 ♥, +10 obrażeń). Po każdym
          pojedynku możesz otworzyć jedną paczkę.
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-3">
        {PACKS.map((pack) => {
          const reason = why(pack);
          return (
            <li
              key={pack.id}
              className="flex flex-col items-center gap-3 rounded-card bg-navy p-5 text-white shadow-lift"
            >
              <button
                type="button"
                onClick={() => open(pack)}
                disabled={!!reason}
                className="group rounded-card transition-transform duration-300 hover:-translate-y-2 hover:rotate-2 disabled:opacity-60 motion-reduce:transition-none"
                aria-hidden="true"
                tabIndex={-1}
              >
                <BoosterPack pack={pack} />
              </button>
              <p className="text-center text-sm text-white/85">{pack.subtitle}</p>
              <Badge tone="navy" className="bg-surface/15">
                {pack.price} talentów
              </Badge>
              <Button
                size="sm"
                onClick={() => open(pack)}
                disabled={!!reason}
                leftIcon={<Icon name="sparkle" size={16} />}
                aria-label={`Otwórz paczkę ${pack.name} za ${pack.price} talentów`}
              >
                Otwórz
              </Button>
              {reason && <p className="text-center text-xs text-white/80">{reason}</p>}
            </li>
          );
        })}
      </ul>
      {opening && (
        <BoosterOpening
          key={opening.key}
          pack={opening.pack}
          cards={opening.cards}
          fresh={opening.fresh}
          onClose={() => setOpening(null)}
          onAgain={canOpenBooster(profile, opening.pack.price) ? () => open(opening.pack) : null}
        />
      )}
    </div>
  );
}
