import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TextField } from "./TextField";

function Demo({ error }: { error?: string }) {
  const [v, setV] = useState("");
  return <TextField label="Kod gry" hint="4 cyfry" value={v} onChange={setV} error={error} />;
}

describe("TextField", () => {
  it("is labelled, described by the hint and controlled", async () => {
    render(<Demo />);
    const input = screen.getByRole("textbox", { name: "Kod gry" });
    expect(input).toHaveAccessibleDescription("4 cyfry");
    await userEvent.type(input, "1234");
    expect(input).toHaveValue("1234");
  });

  it("marks an error and announces it", () => {
    render(<Demo error="Nie ma takiej gry." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Nie ma takiej gry.");
  });
});
