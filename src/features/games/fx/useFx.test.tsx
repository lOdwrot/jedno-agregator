import { act, render, renderHook, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Particles } from "./Particles";
import { useFx } from "./useFx";

describe("useFx + Particles", () => {
  it("spawns effects and drops expired ones on the next spawn", () => {
    const { result } = renderHook(() => useFx());
    act(() => result.current.spawn("stars", 10, 10, 0));
    act(() => result.current.spawn("text", 10, 10, 0.1, { text: "BUM!" }));
    expect(result.current.items).toHaveLength(2);
    act(() => result.current.spawn("burst", 0, 0, 5));
    expect(result.current.items.map((f) => f.kind)).toEqual(["burst"]);
  });

  it("renders only live effects", () => {
    const { result } = renderHook(() => useFx());
    act(() => result.current.spawn("text", 10, 10, 0, { text: "BUM!" }));
    const live = render(
      <svg>
        <Particles items={result.current.items} time={0.2} />
      </svg>,
    );
    expect(within(live.container).getByText("BUM!")).toBeInTheDocument();
    const dead = render(
      <svg>
        <Particles items={result.current.items} time={9} />
      </svg>,
    );
    expect(within(dead.container).queryByText("BUM!")).toBeNull();
  });
});
