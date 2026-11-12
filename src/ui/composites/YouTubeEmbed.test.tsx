import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YouTubeEmbed } from "./YouTubeEmbed";

describe("YouTubeEmbed", () => {
  it("shows a facade and swaps to the nocookie iframe on click", async () => {
    const user = userEvent.setup();
    render(<YouTubeEmbed videoId="abc123" title="Msza święta" />);
    expect(document.querySelector("iframe")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Odtwórz film: Msza święta" }));
    const frame = screen.getByTitle("Msza święta");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0");
  });

  it("renders the iframe immediately with autoplay", () => {
    render(<YouTubeEmbed videoId="xyz" title="T" autoplay />);
    expect(screen.getByTitle("T")).toBeInTheDocument();
  });
});
