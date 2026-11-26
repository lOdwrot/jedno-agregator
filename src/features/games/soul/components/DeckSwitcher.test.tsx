import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ToastProvider } from "@/ui";
import { useProfile } from "../collection/useProfile";
import { DeckBuilder } from "./DeckBuilder";

function Harness() {
  const { profile, update } = useProfile();
  return <DeckBuilder profile={profile} update={update} />;
}
const mount = () =>
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );

describe("DeckSwitcher", () => {
  afterEach(() => localStorage.clear());

  it("switches decks and remembers the active one after a reload", async () => {
    const view = mount();
    expect(screen.getByRole("radio", { name: /Talia 1, 50 z 50/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.click(screen.getByRole("radio", { name: /Talia 2, 0 z 50/ }));
    expect(screen.getByRole("radio", { name: /Talia 2/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Talia 2: 0 \/ 50/)).toBeInTheDocument();
    view.unmount();

    mount(); // "reload": the profile is read again from localStorage
    expect(screen.getByRole("radio", { name: /Talia 2/ })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: /Talia 1/ }));
    expect(screen.getByText(/Talia 1: 50 \/ 50/)).toBeInTheDocument();
  });
});
