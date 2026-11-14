import { useEffect, useRef, useState } from "react";
import { Button, Spinner, TextField } from "@/ui";
import type { DeckList } from "../engine/state";
import { guestHandshake, hostHandshake } from "./handshake";
import type { Link } from "./link";
import { hostGame, isCode, joinGame, type Hosting } from "./peerLink";
import { loadName, saveName, type Session } from "./session";

interface Props {
  deck: DeckList;
  problems: string[];
  onEditDeck: () => void;
  onStart: (s: Session) => void;
}

type Phase =
  | { k: "idle" }
  | { k: "opening" }
  | { k: "hosting"; code: string }
  | { k: "joining" }
  | { k: "dealing" };

const card = "flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card";

/** Multiplayer lobby: one person opens a game and reads out the 4-digit code, the other types it in. */
export function PvpLobby({ deck, problems, onEditDeck, onStart }: Props) {
  const [name, setName] = useState(loadName);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [error, setError] = useState<{ where: "host" | "join"; text: string } | null>(null);
  const hosting = useRef<Hosting | null>(null);
  const pending = useRef<Link | null>(null);
  const alive = useRef(true);

  // leaving the tab cancels whatever was not handed to the duel yet
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      hosting.current?.cancel();
      pending.current?.close();
    };
  }, []);

  const fail = (where: "host" | "join", e: unknown) => {
    if (!alive.current) return;
    pending.current?.close();
    pending.current = null;
    setPhase({ k: "idle" });
    setError({ where, text: e instanceof Error ? e.message : "Coś poszło nie tak." });
  };
  const start = (s: Session) => {
    pending.current = null;
    if (!alive.current) return s.link.close();
    onStart(s);
  };
  const remember = () => saveName(name.trim());

  const open = async () => {
    remember();
    setError(null);
    setPhase({ k: "opening" });
    try {
      const h = await hostGame((link) => {
        pending.current = link;
        setPhase({ k: "dealing" });
        hostHandshake(link, name, deck).then(start, (e: unknown) => {
          fail("host", e);
        });
      });
      if (!alive.current) return h.cancel();
      hosting.current = h;
      setPhase((p) => (p.k === "opening" ? { k: "hosting", code: h.code } : p));
    } catch (e) {
      fail("host", e);
    }
  };
  const cancel = () => {
    hosting.current?.cancel();
    hosting.current = null;
    setPhase({ k: "idle" });
  };
  const join = async () => {
    if (!isCode(code)) {
      setError({ where: "join", text: "Kod gry to 4 cyfry." });
      return;
    }
    remember();
    setError(null);
    setPhase({ k: "joining" });
    try {
      const link = await joinGame(code);
      pending.current = link;
      start(await guestHandshake(link, name, deck));
    } catch (e) {
      fail("join", e);
    }
  };

  if (problems.length)
    return (
      <div className={card}>
        <h2 className="font-display text-xl font-extrabold text-navy">Najpierw przygotuj talię</h2>
        <ul className="list-disc pl-5 text-ink">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Button className="self-start" onClick={onEditDeck}>
          Popraw talię
        </Button>
      </div>
    );

  const busy = phase.k !== "idle";
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-navy p-5 text-white shadow-card">
        <h2 className="font-display text-xl font-extrabold text-logo-yellow">
          <span aria-hidden="true">🤝 </span>Pojedynek z przyjacielem
        </h2>
        <p className="mt-2 max-w-prose text-sm">
          Zagraj na dwóch urządzeniach przez internet. Każdy walczy swoją talią. Jedna osoba zakłada
          grę i podaje 4-cyfrowy kod, druga wpisuje go i dołącza. Pojedynki z przyjacielem nie dają
          talentów — liczy się dobra zabawa.
        </p>
      </div>
      <TextField
        label="Twoje imię (zobaczy je rywal)"
        value={name}
        onChange={setName}
        maxLength={20}
        autoComplete="nickname"
        placeholder="np. Ania"
        className="max-w-sm"
      />
      <div className="grid gap-5 md:grid-cols-2">
        <section className={card} aria-labelledby="pvp-host">
          <h3 id="pvp-host" className="font-display text-lg font-extrabold text-navy">
            Załóż grę
          </h3>
          {phase.k === "hosting" || phase.k === "dealing" ? (
            <>
              <p className="text-ink">Podaj ten kod osobie, z którą chcesz zagrać:</p>
              <p
                className="font-display text-5xl font-extrabold tracking-[0.3em] text-navy"
                aria-label={`Kod gry: ${phase.k === "hosting" ? phase.code.split("").join(" ") : ""}`}
              >
                {phase.k === "hosting" ? phase.code : "····"}
              </p>
              <p role="status" className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner />
                {phase.k === "dealing" ? "Rywal dołącza — tasujemy talie…" : "Czekam na rywala…"}
              </p>
              {phase.k === "hosting" && (
                <Button variant="outline" className="self-start" onClick={cancel}>
                  Anuluj
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-ink">Dostaniesz kod do przekazania rywalowi.</p>
              <Button className="self-start" disabled={busy} onClick={() => void open()}>
                {phase.k === "opening" ? (
                  <>
                    <Spinner /> Zakładam grę…
                  </>
                ) : (
                  "Załóż grę"
                )}
              </Button>
            </>
          )}
          {error?.where === "host" && (
            <p role="alert" className="text-sm font-bold text-danger">
              {error.text}
            </p>
          )}
        </section>
        <section className={card} aria-labelledby="pvp-join">
          <h3 id="pvp-join" className="font-display text-lg font-extrabold text-navy">
            Dołącz do gry
          </h3>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void join();
            }}
          >
            <TextField
              label="Kod gry"
              hint="4 cyfry od osoby, która założyła grę"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0000"
              disabled={busy}
              error={error?.where === "join" ? error.text : null}
              inputClassName="max-w-40 text-center font-display text-2xl tracking-[0.3em]"
            />
            <Button type="submit" className="self-start" disabled={busy}>
              {phase.k === "joining" ? (
                <>
                  <Spinner /> Łączę…
                </>
              ) : (
                "Dołącz"
              )}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
