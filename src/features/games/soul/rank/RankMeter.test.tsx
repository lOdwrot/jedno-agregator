import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { PatronDialog } from "./PatronDialog";
import { RankMeter } from "./RankMeter";
import { rankStops, THRESHOLDS } from "./xp";

describe("RankMeter", () => {
  it("shows the rank, its patron and the progress to the next rank", () => {
    render(<RankMeter xp={THRESHOLDS[1]! + 10} />);
    expect(screen.getByText("Ministrant")).toBeInTheDocument();
    expect(screen.getByText("Patron: św. Pius X")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Postęp do rangi Lektor" })).toHaveAttribute(
      "aria-valuenow",
      "10",
    );
  });

  it("announces the change after a duel", () => {
    render(<RankMeter xp={THRESHOLDS[1]! + 5} from={THRESHOLDS[1]! - 10} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "+15 pkt rangi Awans na rangę: Ministrant.",
    );
  });

  it("stops at every rank boundary on the way", () => {
    expect(rankStops(10, THRESHOLDS[2]! + 5)).toEqual([
      THRESHOLDS[1],
      THRESHOLDS[2],
      THRESHOLDS[2]! + 5,
    ]);
    const down = rankStops(THRESHOLDS[1]! + 5, 20);
    expect(down).toHaveLength(2);
    expect(down[0]).toBeLessThan(THRESHOLDS[1]!);
  });

  it("opens the patron's story from the hub and walks the ladder", async () => {
    function Hub() {
      const [open, setOpen] = useState<number | null>(null);
      return (
        <>
          <RankMeter xp={0} onPatron={() => setOpen(0)} />
          {open !== null && (
            <PatronDialog xp={0} index={open} onSelect={setOpen} onClose={() => setOpen(null)} />
          )}
        </>
      );
    }
    render(<Hub />);
    await userEvent.click(screen.getByRole("button", { name: /Patron rangi: św. Wojciech/ }));
    expect(screen.getByRole("dialog", { name: /Katechumen — św. Wojciech/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Opoka/ }));
    expect(screen.getByRole("dialog", { name: /Opoka — św. Piotr Apostoł/ })).toBeInTheDocument();
  });
});
