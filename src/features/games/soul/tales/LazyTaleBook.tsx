import { lazy, Suspense, type ComponentProps } from "react";

const Book = lazy(() => import("./TaleBook"));

/** The tale book is loaded only when a tale is actually unlocked. */
export function LazyTaleBook(props: ComponentProps<typeof Book>) {
  return (
    <Suspense fallback={null}>
      <Book {...props} />
    </Suspense>
  );
}
