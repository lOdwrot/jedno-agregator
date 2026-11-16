import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaleBook from "./TaleBook";
import { taleOf } from "./stories";

function readAndAnswer(right: boolean, replay = false) {
  const tale = taleOf("biedaczyna")!;
  const onWin = vi.fn();
  render(<TaleBook cardId={tale.id} onWin={onWin} replay={replay} onClose={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Poznaj świętego|Przeżyj opowieść/ }));
  for (let i = 0; i < tale.pages.length; i++)
    fireEvent.click(screen.getByRole("button", { name: /Dalej →|Do quizu/ }));
  tale.quiz.forEach((q, i) => {
    const pick = right || i < 2 ? q.answer : (q.answer + 1) % q.options.length;
    fireEvent.click(screen.getByRole("radio", { name: q.options[pick]! }));
    fireEvent.click(screen.getByRole("button", { name: /Dalej|Sprawdź odpowiedzi/ }));
  });
  return onWin;
}

describe("TaleBook", () => {
  it("gives the card with the big reveal only when all three answers are right", () => {
    const onWin = readAndAnswer(true);
    expect(onWin).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Zdobyto kartę!")).toBeTruthy();
  });

  it("shows the 'Niestety' screen with the missed question and another try", () => {
    const onWin = readAndAnswer(false);
    expect(onWin).not.toHaveBeenCalled();
    expect(screen.getByText("Niestety…")).toBeTruthy();
    expect(screen.getByText(taleOf("biedaczyna")!.quiz[2].q)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj jeszcze raz" }));
    expect(screen.getByText("Pytanie 1 z 3")).toBeTruthy();
  });

  it("a replay ends without a card", () => {
    const onWin = readAndAnswer(true, true);
    expect(onWin).not.toHaveBeenCalled();
    expect(screen.queryByText("Zdobyto kartę!")).toBeNull();
    expect(screen.getByText(/Wszystkie odpowiedzi dobre/)).toBeTruthy();
  });
});
