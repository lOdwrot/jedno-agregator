import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getConsent, resetConsent } from "@/lib/consent";
import { ConsentBanner, reopenConsent } from "./ConsentBanner";
import { act } from "react";

afterEach(() => {
  resetConsent();
  localStorage.clear();
});

describe("ConsentBanner", () => {
  it("is hidden when statistics are off", () => {
    render(<ConsentBanner enabled={false} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("asks once and stays hidden after accepting", async () => {
    const { unmount } = render(<ConsentBanner enabled />);
    const region = screen.getByRole("region", { name: /policzyć Cię tylko raz/ });
    expect(region).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Zgadzam się" }));
    expect(getConsent()).toBe("granted");
    expect(screen.queryByRole("region")).toBeNull();
    unmount();
    render(<ConsentBanner enabled />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("refusing is as easy and the footer link reopens it with focus", async () => {
    render(<ConsentBanner enabled />);
    await userEvent.click(screen.getByRole("button", { name: "Nie zgadzam się" }));
    expect(getConsent()).toBe("denied");
    expect(screen.queryByRole("region")).toBeNull();
    act(() => reopenConsent());
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
  });
});
