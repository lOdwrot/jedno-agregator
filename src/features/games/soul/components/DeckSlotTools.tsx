import { useState } from "react";
import { Button, Dialog, TextField, useToast } from "@/ui";
import {
  activeDeckIndex,
  clearActiveDeck,
  copyActiveDeck,
  deckSlots,
  MAX_DECK_NAME,
  renameDeck,
  shownName,
  slotSize,
} from "../collection/decks";
import type { Profile } from "../collection/profile";

/** Name of the active deck, copy it to another slot, start it over. */
export function DeckSlotTools({
  profile,
  update,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
}) {
  const [confirm, setConfirm] = useState<{ kind: "copy"; to: number } | { kind: "clear" } | null>(
    null,
  );
  const { toast } = useToast();
  const active = activeDeckIndex(profile);
  const slots = deckSlots(profile);
  const activeName = shownName(slots[active]!, active);
  const others = slots.map((s, i) => ({ s, i })).filter(({ i }) => i !== active);

  const copy = (to: number) => {
    update((p) => copyActiveDeck(p, to));
    toast(`Skopiowano do: ${shownName(slots[to]!, to)}.`, { tone: "success" });
    setConfirm(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Nazwa talii"
        value={slots[active]!.name}
        maxLength={MAX_DECK_NAME}
        onChange={(v) => update((p) => renameDeck(p, active, v))}
        className="max-w-xs"
      />
      <div className="flex flex-wrap gap-2">
        {others.map(({ s, i }) => (
          <Button
            key={i}
            size="sm"
            variant="outline"
            onClick={() => (slotSize(s) > 0 ? setConfirm({ kind: "copy", to: i }) : copy(i))}
          >
            Skopiuj do: {shownName(s, i)}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          disabled={slotSize(slots[active]!) === 0}
          onClick={() => setConfirm({ kind: "clear" })}
        >
          Wyczyść talię
        </Button>
      </div>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "clear" ? "Wyczyścić talię?" : "Nadpisać talię?"}
        size="sm"
      >
        {confirm && (
          <div className="flex flex-col gap-4">
            <p>
              {confirm.kind === "clear"
                ? `Wszystkie karty wrócą z talii „${activeName}” do kolekcji.`
                : `Talia „${shownName(slots[confirm.to]!, confirm.to)}” zostanie zastąpiona kopią „${activeName}”.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (confirm.kind === "copy") copy(confirm.to);
                  else {
                    update(clearActiveDeck);
                    setConfirm(null);
                  }
                }}
              >
                {confirm.kind === "clear" ? "Wyczyść" : "Nadpisz"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Anuluj
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
