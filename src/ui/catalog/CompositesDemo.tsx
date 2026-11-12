import { useState } from "react";
import {
  Button, Carousel, Card, Dialog, EmptyState, ErrorState, InstagramEmbed, LoadingState, Marquee, Section, Select,
  ShareButton, Sheet, Tabs, Text, useToast, YouTubeEmbed, Badge, Cluster,
} from "..";
import { Demo, Group } from "./Demo";

export function CompositesDemo() {
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [sel, setSel] = useState("");
  const { toast } = useToast();
  return (
    <Group id="composites" title="Kompozycje">
      <Demo name="Dialog / Sheet / Toast / ShareButton">
        <Cluster>
          <Button onClick={() => setDialog(true)}>Otwórz Dialog</Button>
          <Button variant="navy" onClick={() => setSheet(true)}>Otwórz Sheet</Button>
          <Button variant="soft" onClick={() => toast("Zapisano!", { tone: "success" })}>Toast</Button>
          <ShareButton title="Katalog komponentów" />
        </Cluster>
        <Dialog open={dialog} onClose={() => setDialog(false)} title="Przykładowy dialog" description="Esc, tło lub X zamyka.">
          <Text>Treść dialogu. Fokus jest uwięziony wewnątrz i wraca na przycisk po zamknięciu.</Text>
        </Dialog>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Filtruj aktualności">
          <Select label="Autor" value={sel} onChange={setSel} placeholder="Wszyscy" options={[{ value: "1", label: "Archidiecezja" }, { value: "2", label: "Caritas" }]} />
        </Sheet>
      </Demo>
      <Demo name="Tabs">
        <Tabs label="Media" items={[
          { value: "f", label: "Filmy", content: <Text>Panel filmów.</Text> },
          { value: "i", label: "Instagram", content: <Text>Panel Instagrama.</Text> },
        ]} />
      </Demo>
      <Demo name="Section + Carousel">
        <Section title="Najbliższe wydarzenia" eyebrow="Wkrótce" action={{ label: "Wszystkie wydarzenia", to: "/wydarzenia" }} reveal={false} className="py-0">
          <Carousel label="Najbliższe wydarzenia">
            {Array.from({ length: 7 }, (_, i) => (
              <Card key={i} tilt className="h-32 p-5"><Badge tone="accent">Wydarzenie {i + 1}</Badge></Card>
            ))}
          </Carousel>
        </Section>
      </Demo>
      <Demo name="Marquee">
        <Marquee label="Społeczności">
          {["Oaza", "Caritas", "Neokatechumenat", "Odnowa", "Schola", "Harcerze"].map((n) => (
            <span key={n} className="rounded-pill bg-surface-muted px-5 py-2 font-bold text-navy">{n}</span>
          ))}
        </Marquee>
      </Demo>
      <Demo name="EmptyState / ErrorState / LoadingState">
        <EmptyState title="Brak wydarzeń" description="Spróbuj zmienić filtry." />
        <ErrorState onRetry={() => toast("Ponawiam…")} />
        <LoadingState />
      </Demo>
      <Demo name="YouTubeEmbed">
        <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Przykładowy film" className="max-w-xl" />
      </Demo>
      <Demo name="InstagramEmbed">
        <InstagramEmbed url="https://www.instagram.com/p/DEMO/" caption="Przykładowy post" className="max-w-md" />
      </Demo>
    </Group>
  );
}
