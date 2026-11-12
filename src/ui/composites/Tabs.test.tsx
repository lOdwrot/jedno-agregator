import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const items = [
  { value: "one", label: "Filmy", content: <p>Panel filmów</p> },
  { value: "two", label: "Instagram", content: <p>Panel IG</p> },
  { value: "three", label: "Inne", content: <p>Panel inne</p> },
];

describe("Tabs", () => {
  it("moves focus and selection with arrow keys (roving tabindex)", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Media" items={items} />);
    const first = screen.getByRole("tab", { name: "Filmy" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Instagram" })).toHaveAttribute("tabindex", "-1");
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Instagram" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel IG");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Inne" })).toHaveAttribute("aria-selected", "true");
  });

  it("calls onChange when controlled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs label="Media" items={items} value="one" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Instagram" }));
    expect(onChange).toHaveBeenCalledWith("two");
  });
});
