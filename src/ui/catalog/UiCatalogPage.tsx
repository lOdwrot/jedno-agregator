import { useEffect } from "react";
import { usePageTitle } from "@/lib/seo";
import { Container, Text, ScrollProgress, ToastProvider, Heading } from "..";
import { CompositesDemo } from "./CompositesDemo";
import { EffectsDemo } from "./EffectsDemo";
import { PrimitivesDemo } from "./PrimitivesDemo";

const navLink = "inline-flex min-h-11 items-center font-bold text-accent-ink underline underline-offset-4";

/** Hidden component catalog at /ui (noindex). */
export function UiCatalogPage() {
  usePageTitle("Katalog komponentów");
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <ToastProvider>
      <ScrollProgress />
      <Container className="py-10">
        <Heading level={1} size="2xl">Katalog komponentów</Heading>
        <Text variant="lead" className="mt-2 text-ink-muted">Wszystkie komponenty z <code>@/ui</code> w jednym miejscu.</Text>
        <nav aria-label="Sekcje katalogu" className="mt-4 flex gap-4">
          <a href="#primitives" className={navLink}>Prymitywy</a>
          <a href="#composites" className={navLink}>Kompozycje</a>
          <a href="#effects" className={navLink}>Efekty</a>
        </nav>
        <PrimitivesDemo />
        <CompositesDemo />
        <EffectsDemo />
      </Container>
    </ToastProvider>
  );
}
