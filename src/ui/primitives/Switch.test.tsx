import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

function Harness() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onChange={setOn} label="Wibracje" description="Na telefonie" />;
}

describe("Switch", () => {
  it("is a labelled switch that toggles on click and keyboard", async () => {
    render(<Harness />);
    const sw = screen.getByRole("switch", { name: /Wibracje/ });
    expect(sw).toHaveAttribute("aria-checked", "true");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
    sw.focus();
    await userEvent.keyboard("{Enter}");
    expect(sw).toHaveAttribute("aria-checked", "true");
  });
});
