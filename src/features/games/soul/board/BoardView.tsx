import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { getCard } from "../data/cards";
import type { Action } from "../engine/actions";
import { canUseAbility } from "../engine/abilities";
import { hpLeft, inPlay, maxHp, type Game } from "../engine/state";
import type { Selection } from "../components/CardActions";
import type { BoardRenderer } from "./BoardRenderer";
import { dropsFor, isPlayable, type Drop } from "./dnd";
import { benchZone, computeSlots, inside, PLACE_KEY, slotRect, type Slot } from "./layout";

interface Props {
  view: Game;
  live: Game;
  busy: boolean;
  reduced: boolean;
  renderer: RefObject<BoardRenderer | null>;
  onSelect: (s: Selection | { zone: "place" }) => void;
  onAction: (a: Action) => void;
}

const ZONE_LABEL = {
  hand: "w ręce",
  active: "aktywna",
  bench: "na ławce",
  discard: "na stosie odrzuconych",
  place: "miejsce w grze",
};

function label(g: Game, s: Slot): string {
  if (s.key === PLACE_KEY) return `Miejsce: ${g.place ? getCard(g.place.cardId).name : ""}`;
  const p = g.players[s.pid];
  const play = [p.active, ...p.bench].find((c) => c?.uid === s.key);
  const c = play ?? [...p.hand, ...p.discard].find((x) => x.uid === s.key);
  if (!c) return "Karta";
  const who = s.pid === "me" ? "Twoja karta" : "Pomiot";
  const hp = play ? `, wytrwałość ${hpLeft(play)} z ${maxHp(play)}, energia ${play.energy}` : "";
  return `${getCard(c.cardId).name} — ${who} ${ZONE_LABEL[s.zone]}${hp}`;
}

/** Canvas board (Pixi) + an invisible layer of real buttons for touch, mouse, keyboard and screen readers. */
export function BoardView({ view, live, busy, reduced, renderer, onSelect, onAction }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 640 });
  const [failed, setFailed] = useState(false);
  const drag = useRef<{
    uid: number;
    x0: number;
    y0: number;
    moved: boolean;
    drops: Drop[];
  } | null>(null);
  const suppress = useRef(false);

  // create the Pixi app once
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;
    let r: BoardRenderer | null = null;
    void import("./BoardRenderer")
      .then(async ({ BoardRenderer: R }) => {
        r = new R();
        await r.init(el, reduced);
        if (!alive) return r.destroy();
        r.resize(el.clientWidth, el.clientHeight);
        renderer.current = r;
        await r.reconcile(view, 520, 70);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      renderer.current = null;
      r?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) {
        setSize({ w, h });
        renderer.current?.resize(w, h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [renderer]);

  useEffect(() => {
    renderer.current?.setHighlights({
      playable: busy
        ? []
        : live.players.me.hand.filter((c) => isPlayable(live, c)).map((c) => c.uid),
      abilities: busy
        ? []
        : inPlay(live.players.me)
            .filter((c) => canUseAbility(live, "me", c))
            .map((c) => c.uid),
      targets: [],
      bench: false,
    });
  }, [live, busy, renderer, view]);

  const slots = computeSlots(view, size.w, size.h).filter(
    (s) => s.zone !== "hand" || s.pid === "me",
  );

  const local = (e: PointerEvent) => {
    const b = host.current!.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  const onDown = (e: PointerEvent<HTMLButtonElement>, s: Slot) => {
    if (busy || s.zone !== "hand" || s.pid !== "me") return;
    const c = live.players.me.hand.find((x) => x.uid === s.key);
    if (!c) return;
    const { x, y } = local(e);
    drag.current = { uid: s.key, x0: x, y0: y, moved: false, drops: dropsFor(live, c) };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const { x, y } = local(e);
    if (!d.moved && Math.hypot(x - d.x0, y - d.y0) < 10) return;
    if (!d.moved) {
      d.moved = true;
      renderer.current?.setHighlights({
        playable: [],
        targets: d.drops.flatMap((x) => (x.target.kind === "card" ? [x.target.uid] : [])),
        bench: d.drops.some((x) => x.target.kind === "bench"),
      });
    }
    renderer.current?.dragMove(d.uid, x, y);
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    void e;
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    suppress.current = true;
    const { x, y } = local(e);
    const hitCard = computeSlots(live, size.w, size.h).find(
      (s) => s.zone !== "hand" && inside(slotRect(s), x, y),
    );
    const drop = d.drops.find((o) =>
      o.target.kind === "card"
        ? hitCard?.key === o.target.uid
        : o.target.kind === "bench"
          ? inside(benchZone(live, size.w, size.h), x, y)
          : y < size.h * 0.8,
    );
    void renderer.current?.dragEnd();
    if (drop) onAction(drop.action);
  };

  return (
    <div ref={host} className="relative size-full touch-none overflow-hidden select-none">
      {failed && (
        <p className="absolute inset-x-4 top-4 rounded-card bg-surface p-3 text-sm text-ink">
          Twoja przeglądarka nie obsługuje grafiki WebGL. Karty wciąż możesz wybierać przyciskami
          (Tab).
        </p>
      )}
      <ul className="absolute inset-0" aria-label="Karty na stole i w Twojej ręce">
        {slots.map((s) => {
          const r = slotRect(s);
          return (
            <li key={s.key} className="contents">
              <button
                type="button"
                aria-label={label(view, s)}
                onPointerDown={(e) => onDown(e, s)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerEnter={() => s.zone === "hand" && renderer.current?.setHover(s.key)}
                onPointerLeave={() => renderer.current?.setHover(null)}
                onClick={(e) => {
                  if (suppress.current) {
                    suppress.current = false;
                    e.preventDefault();
                    return;
                  }
                  if (s.key === PLACE_KEY) onSelect({ zone: "place" });
                  else
                    onSelect({
                      zone: s.zone === "hand" ? "hand" : s.pid === "me" ? "field" : "opp",
                      uid: s.key,
                    });
                }}
                className="absolute rounded-card bg-transparent focus-visible:outline-4 focus-visible:outline-logo-yellow"
                style={{ left: r.x, top: r.y, width: r.w, height: r.h, zIndex: s.z }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
