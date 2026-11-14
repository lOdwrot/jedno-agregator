import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge, Button, Heading, Icon } from "@/ui";
import { getCard } from "../data/cards";
import { FINISH_LABEL, RARITY_LABEL, RARITY_SYMBOL } from "../data/types";
import {
  BOOSTER_PRICE,
  canOpenBooster,
  openBooster,
  owned,
  parseKey,
  rollBooster,
  type CardKey,
  type Profile,
} from "../collection/profile";
import { CardFace } from "./CardFace";
import { sfx } from "../audio/sfx";

/** Buy and open a booster; cards flip one by one, the rarest comes last. */
export function BoosterShop({
  profile,
  update,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
}) {
  const [pack, setPack] = useState<{ cards: CardKey[]; fresh: boolean[] } | null>(null);
  const [shown, setShown] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  const reveal = (n: number) => {
    if (!pack) return;
    for (let i = shown; i < n; i++) {
      const r = getCard(parseKey(pack.cards[i]!).cardId).rarity;
      setTimeout(
        () => (r === "legendary" ? sfx.win() : r === "rare" ? sfx.soul() : sfx.draw()),
        (i - shown) * 120,
      );
    }
    setShown(n);
  };

  const open = () => {
    sfx.shuffle();
    const cards = rollBooster();
    const seen = new Set<CardKey>();
    const fresh = cards.map((k) => {
      const isNew = owned(profile, k) === 0 && !seen.has(k);
      seen.add(k);
      return isNew;
    });
    update((p) => openBooster(p, cards));
    setPack({ cards, fresh });
    setShown(0);
    setZoom(null);
  };

  const why =
    profile.packs <= 0
      ? "Rozegraj pojedynek, żeby zdobyć kolejny booster (1 po każdej walce)."
      : profile.talents < BOOSTER_PRICE
        ? `Brakuje ${BOOSTER_PRICE - profile.talents} talentów.`
        : null;
  const last = pack ? pack.cards[Math.min(shown, pack.cards.length) - 1] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4 rounded-card bg-navy p-5 text-white shadow-lift">
        <span aria-hidden="true" className="text-5xl">
          🎁
        </span>
        <div className="min-w-0 flex-1">
          <Heading level={3} size="sm" tone="light">
            Booster „Wspólnota”
          </Heading>
          <p className="text-sm text-white/85">
            5 kart: 3 pospolite, 1 niepospolita, 1 rzadka lub legendarna (papieże!). Każda może
            trafić się w wersji złoconej ✦ (+10 ♥) albo witrażowej ❖ (+20 ♥, +10 obrażeń).
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <Button
            onClick={open}
            disabled={!canOpenBooster(profile)}
            leftIcon={<Icon name="sparkle" size={18} />}
          >
            Otwórz ({BOOSTER_PRICE} talentów)
          </Button>
          {why && <p className="text-xs text-white/85">{why}</p>}
        </div>
      </div>

      {pack && (
        <section aria-labelledby="soul-pack" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="soul-pack" className="font-display text-lg font-extrabold text-navy">
              Twój booster
            </h3>
            {shown < pack.cards.length && (
              <Button variant="ghost" size="sm" onClick={() => reveal(pack.cards.length)}>
                Odkryj wszystkie
              </Button>
            )}
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {pack.cards.map((k, i) => {
              const { cardId, finish } = parseKey(k);
              const c = getCard(cardId);
              const up = i < shown;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => (up ? setZoom(i) : i === shown && reveal(shown + 1))}
                    aria-disabled={!up && i !== shown ? true : undefined}
                    className="group block aspect-[5/7] w-full rounded-card perspective-[800px]"
                  >
                    <span
                      className={cn(
                        "relative block size-full transition-transform duration-700 ease-out transform-3d",
                        up && "rotate-y-180",
                      )}
                    >
                      <span className="absolute inset-0 grid place-items-center rounded-card bg-gradient-to-br from-navy to-logo-blue text-4xl text-white shadow-card backface-hidden">
                        <span aria-hidden="true">🕊️</span>
                        {!up && (
                          <span className="sr-only">
                            Zakryta karta {i + 1}
                            {i === shown ? " — odkryj" : ""}
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-1 rounded-card bg-surface p-2 text-center shadow-card backface-hidden",
                          finish === "gilded" && "ring-4 ring-logo-yellow",
                          finish === "stained" && "ring-4 ring-logo-blue",
                          c.rarity === "legendary" && "bg-accent-soft",
                        )}
                      >
                        {up && (
                          <>
                            <span aria-hidden="true" className="text-4xl">
                              {c.emoji}
                            </span>
                            <span className="line-clamp-2 text-xs font-extrabold text-navy sm:text-sm">
                              {c.name}
                            </span>
                            <span className="text-xs text-ink-muted">
                              {RARITY_SYMBOL[c.rarity]}{" "}
                              {finish !== "plain" ? FINISH_LABEL[finish] : ""}
                            </span>
                            <span className="sr-only">
                              , {RARITY_LABEL[c.rarity]}, {FINISH_LABEL[finish]}. Pokaż kartę
                            </span>
                            {pack.fresh[i] && <Badge tone="navy">nowa!</Badge>}
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="text-sm font-bold text-navy">
            {last &&
              `Odkryto: ${getCard(parseKey(last).cardId).name} (${RARITY_LABEL[getCard(parseKey(last).cardId).rarity]}, ${FINISH_LABEL[parseKey(last).finish]}).`}
          </p>
          {zoom !== null && pack.cards[zoom] && (
            <div className="mx-auto w-full max-w-xs">
              <CardFace
                cardId={parseKey(pack.cards[zoom]).cardId}
                finish={parseKey(pack.cards[zoom]).finish}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
