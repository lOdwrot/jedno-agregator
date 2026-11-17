import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageTurn } from "./PageTurn";

const page = (i: number) => <p>Strona {i}</p>;

describe("PageTurn", () => {
  it("keeps the turning leaf on top but hidden from assistive tech", () => {
    const { rerender } = render(<PageTurn index={0} render={page} sound={false} />);
    expect(screen.getByText("Strona 0")).toBeVisible();
    rerender(<PageTurn index={1} render={page} sound={false} />);
    // Both sheets are on screen while the leaf swings; only the new page is in the a11y tree.
    expect(screen.getByText("Strona 0").closest("[aria-hidden]")).not.toBeNull();
    expect(screen.getByText("Strona 1").closest("[aria-hidden]")).toBeNull();
  });

  it("turning back brings the previous leaf over the current page", () => {
    const { rerender } = render(<PageTurn index={2} render={page} sound={false} />);
    rerender(<PageTurn index={1} render={page} sound={false} />);
    expect(screen.getByText("Strona 2").closest("[aria-hidden]")).not.toBeNull();
    expect(screen.getByText("Strona 1").closest("[aria-hidden]")).toBeNull();
  });
});
