import { useState } from "react";
import { Button, ChipGroup, Dialog } from "@/ui";
import { getCard } from "../data/cards";
import { cardNumberLabel } from "../data/numbers";
import { FINISH_LABEL, type Finish } from "../data/types";
import type { AlbumEntry } from "../collection/album";
import { TiltCard } from "./TiltCard";

const FINISH_MARK: Record<Finish, string> = { plain: "", gilded: "✦ ", stained: "❖ " };

/** An album card up close: turn it in your hand, switch between the owned prints. */
export function AlbumCardDialog({
  entry,
  onClose,
}: {
  entry: AlbumEntry | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!entry}
      onClose={onClose}
      title={entry ? getCard(entry.cardId).name : "Karta"}
      size="sm"
      description={entry ? `Nr ${cardNumberLabel(entry.cardId)}` : undefined}
    >
      {entry && <Body key={entry.cardId} entry={entry} onClose={onClose} />}
    </Dialog>
  );
}

function Body({ entry, onClose }: { entry: AlbumEntry; onClose: () => void }) {
  const [finish, setFinish] = useState<Finish>(entry.best ?? "plain");
  return (
    <div className="flex flex-col gap-3">
      {entry.finishes.length > 1 && (
        <ChipGroup
          label="Wersja karty"
          value={finish}
          onChange={(v) => v && setFinish(v as Finish)}
          options={entry.finishes.map((f) => ({
            value: f,
            label: `${FINISH_MARK[f]}${FINISH_LABEL[f]} ×${entry.copies[f]}`,
          }))}
        />
      )}
      <div className="-mx-2 overflow-hidden">
        <TiltCard key={finish} cardId={entry.cardId} finish={finish} />
      </div>
      <p className="text-center text-sm text-ink-muted">
        Przeciągnij kartę palcem (albo użyj strzałek), aby obejrzeć ją pod różnymi kątami.
        {finish === "stained" && " Witraż sypie szkiełkami tym mocniej, im szybciej ją obracasz!"}
      </p>
      <p className="text-center text-sm font-bold text-navy">
        Masz: {entry.finishes.map((f) => `${entry.copies[f]}× ${FINISH_LABEL[f]}`).join(", ")}
      </p>
      <Button variant="navy" fullWidth onClick={onClose}>
        Wróć do albumu
      </Button>
    </div>
  );
}
