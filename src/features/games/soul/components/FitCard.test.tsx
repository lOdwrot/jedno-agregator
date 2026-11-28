import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FitCard } from "./FitCard";
import { fitScale } from "./fitScale";

describe("fitScale", () => {
  it("enlarges the card only up to 1.5×", () => {
    expect(fitScale(320, 500, 1000, 1000)).toBe(1.5);
    expect(fitScale(320, 500, 352, 1000)).toBe(1.1);
  });
  it("fits the tighter side of the box", () => {
    expect(fitScale(320, 500, 320, 250)).toBe(0.5);
    expect(fitScale(320, 500, 160, 1000)).toBe(0.5);
  });
  it("keeps the text readable (minimum scale)", () => {
    expect(fitScale(320, 500, 320, 50)).toBe(0.45);
  });
  it("ignores an unmeasured box", () => {
    expect(fitScale(320, 0, 320, 250)).toBe(1);
  });
});

describe("FitCard", () => {
  it("shows the flat card face without the turning slider", () => {
    render(<FitCard cardId="lektor" finish="plain" />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getAllByText("Lektor").length).toBeGreaterThan(0);
  });
});
