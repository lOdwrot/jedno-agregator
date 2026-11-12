import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Button } from "./Button";

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Button", () => {
  it("renders a button by default with type=button", () => {
    wrap(<Button>Kliknij</Button>);
    expect(screen.getByRole("button", { name: "Kliknij" })).toHaveAttribute("type", "button");
  });

  it("renders a router link when `to` is given", () => {
    wrap(<Button to="/wydarzenia">Wydarzenia</Button>);
    expect(screen.getByRole("link", { name: "Wydarzenia" })).toHaveAttribute("href", "/wydarzenia");
  });

  it("renders external anchors in a new tab with a hidden hint", () => {
    wrap(<Button href="https://example.com/x">Zobacz</Button>);
    const a = screen.getByRole("link", { name: /Zobacz/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(a).toHaveTextContent("(otwiera się w nowej karcie)");
  });

  it("blocks clicks while loading", () => {
    wrap(<Button loading>Zapisz</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
