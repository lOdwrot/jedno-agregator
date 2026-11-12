import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipGroup } from "./ChipGroup";

const options = [
  { value: "a", label: "Alfa" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function Harness({ allowClear }: { allowClear?: boolean }) {
  const [v, setV] = useState<string | null>("a");
  return (
    <ChipGroup label="Autor" options={options} value={v} onChange={setV} allowClear={allowClear} />
  );
}

describe("ChipGroup", () => {
  it("has roving tabindex and selects with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Alfa" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveAttribute("tabindex", "-1");
    screen.getByRole("radio", { name: "Alfa" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Gamma" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Alfa" })).toHaveAttribute("aria-checked", "true");
  });

  it("clicking the active chip clears when allowClear", async () => {
    const user = userEvent.setup();
    render(<Harness allowClear />);
    await user.click(screen.getByRole("radio", { name: "Alfa" }));
    expect(screen.getByRole("radio", { name: "Alfa" })).toHaveAttribute("aria-checked", "false");
  });

  it("keeps selection when clicking active without allowClear", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: "Alfa" }));
    expect(screen.getByRole("radio", { name: "Alfa" })).toHaveAttribute("aria-checked", "true");
  });
});
