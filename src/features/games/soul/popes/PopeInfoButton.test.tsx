import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CardFace } from "../components/CardFace";

describe("PopeInfoButton", () => {
  it("only pope cards get the story button", () => {
    render(<CardFace cardId="kandydat" />);
    expect(screen.queryByRole("button", { name: /Poznaj historię/ })).not.toBeInTheDocument();
  });

  it("opens the story of a pope and switches to another one from the timeline", async () => {
    render(<CardFace cardId="jp2" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Poznaj historię: Św. Jan Paweł II" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Historia: Św. Jan Paweł II" });
    expect(within(dialog).getByText("Czy wiesz, że…")).toBeInTheDocument();
    expect(within(dialog).getByText("Westerplatte i Wybrzeże")).toBeInTheDocument();
    expect(within(dialog).getByText(/Poznane historie: 1 \/ 14/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: /^Św\. Piotr, od 33/ }));
    expect(within(dialog).getByText("Rybak z charakterem")).toBeInTheDocument();
    expect(within(dialog).getByText(/Poznane historie: 2 \/ 14/)).toBeInTheDocument();
  });
});
