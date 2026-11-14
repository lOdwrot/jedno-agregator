import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrestigeLayers } from "./PrestigeLayers";

describe("PrestigeLayers", () => {
  it("renders nothing for plain prints", () => {
    const { container } = render(<PrestigeLayers finish="plain" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives gilded prints a shimmering foil only", () => {
    const { container } = render(<PrestigeLayers finish="gilded" />);
    expect(container.querySelector(".soul-foil--gilded")).not.toBeNull();
    expect(container.querySelector(".soul-glass")).toBeNull();
    expect(container.querySelector(".soul-sparkles")).toBeNull();
  });

  it("gives stained prints foil, glass and hidden-from-AT sparkles", () => {
    const { container } = render(<PrestigeLayers finish="stained" dark />);
    expect(container.querySelector(".soul-foil--stained.soul-foil--dark")).not.toBeNull();
    expect(container.querySelector(".soul-glass")).not.toBeNull();
    const sparks = container.querySelector(".soul-sparkles");
    expect(sparks?.getAttribute("aria-hidden")).toBe("true");
    expect(sparks?.children.length).toBeGreaterThan(5);
  });
});
