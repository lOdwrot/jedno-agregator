import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaleBook from "./TaleBook";
import { taleOf } from "./stories";

function readAndAnswer(right: boolean) {
  const tale = taleOf("biedaczyna")!;
  const onWin = vi.fn();
  render(<TaleBook cardId={tale.id} onWin={onWin} onClose={() => {}} />);
  expect(screen.getByText("Nowa opowieść o świętym!")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Poznaj świętego/ }));
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
  it("gives the card only when all three answers are right, after the last one", () => {
    const onWin = readAndAnswer(true);
    expect(onWin).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Poprawne odpowiedzi: 3 / 3")).toBeTruthy();
  });

  it("shows the score and offers another try after a wrong answer", () => {
    const onWin = readAndAnswer(false);
    expect(onWin).not.toHaveBeenCalled();
    expect(screen.getByText("Poprawne odpowiedzi: 2 / 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Spróbuj quizu ponownie" })).toBeTruthy();
  });
});
