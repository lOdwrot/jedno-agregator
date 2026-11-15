import { render } from "@testing-library/react";
import { usePageScrollLock } from "./usePageScrollLock";

function Lock() {
  usePageScrollLock();
  return null;
}
function Outer({ inner }: { inner: boolean }) {
  usePageScrollLock();
  return inner ? <Lock /> : null;
}

describe("usePageScrollLock", () => {
  it("unlocks only after the last lock unmounts, in any order", () => {
    const html = document.documentElement;
    const { rerender, unmount } = render(<Outer inner />);
    expect(html.style.overflow).toBe("hidden");
    rerender(<Outer inner={false} />);
    expect(html.style.overflow).toBe("hidden");
    rerender(<Outer inner />);
    // parent and child unmount together (parent cleanup runs first)
    unmount();
    expect(html.style.overflow).toBe("");
  });
});
