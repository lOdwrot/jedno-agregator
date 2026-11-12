import { useState } from "react";
import {
  AnimatedBlobs,
  BrushUnderline,
  Button,
  Counter,
  Grain,
  Magnetic,
  PageHeader,
  Parallax,
  Reveal,
  RevealGroup,
  RevealItem,
  SplitText,
  Spotlight,
  Heading,
  Card,
  Text,
  usePrefersReducedMotion,
  IconButton,
  Icon,
} from "..";
import { Demo, Group } from "./Demo";

export function EffectsDemo() {
  const reduce = usePrefersReducedMotion();
  const [k, setK] = useState(0);
  return (
    <Group id="effects" title="Efekty">
      <Demo name="PageHeader (SplitText + akcent)">
        <PageHeader
          key={k}
          eyebrow="Przykład"
          title="Aktualności"
          accent="dla Ciebie"
          description="Najnowsze wiadomości z archidiecezji."
          actions={
            <IconButton label="Filtruj" badge variant="soft">
              <Icon name="filter" />
            </IconButton>
          }
          className="py-0"
        />
        <Button size="sm" variant="ghost" onClick={() => setK((n) => n + 1)}>
          Odtwórz ponownie
        </Button>
      </Demo>
      <Demo name="Spotlight + AnimatedBlobs + Grain">
        <Spotlight className="relative isolate overflow-hidden rounded-card bg-surface-muted p-10 text-center">
          <AnimatedBlobs />
          <Grain />
          <Heading level={3} size="xl">
            Poruszaj myszą <BrushUnderline>tutaj</BrushUnderline>
          </Heading>
        </Spotlight>
      </Demo>
      <Demo name="Reveal / RevealGroup">
        <Reveal>
          <Text>Ten tekst wjeżdża przy przewinięciu.</Text>
        </Reveal>
        <RevealGroup className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <RevealItem key={n}>
              <Card className="p-4">Element {n}</Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Demo>
      <Demo name="Counter / Magnetic / Parallax / SplitText (litery)">
        <Heading level={3} size="2xl">
          <Counter value={1280} /> wydarzeń
        </Heading>
        <Magnetic>
          <Button variant="navy">Magnetic wrapper</Button>
        </Magnetic>
        <Parallax distance={40}>
          <Card className="p-5">Parallax {reduce ? "(wyłączony)" : ""}</Card>
        </Parallax>
        <Heading level={3}>
          <SplitText text="Litera po literze" by="letter" trigger="inView" />
        </Heading>
      </Demo>
    </Group>
  );
}
