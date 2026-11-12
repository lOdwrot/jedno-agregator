import { useState } from "react";
import {
  Avatar, Badge, Button, Card, Chip, ChipGroup, Cluster, DatePill, Divider, Eyebrow, Heading, Icon, IconButton,
  Link, Skeleton, SkeletonCard, SmartImage, Text, iconNames, JednoLogo,
} from "..";
import { Demo, Group } from "./Demo";

const IMG = "https://admin.jedno.net/media/does-not-exist.jpg";

export function PrimitivesDemo() {
  const [author, setAuthor] = useState<string | null>("a");
  const [pressed, setPressed] = useState(false);
  return (
    <Group id="primitives" title="Prymitywy">
      <Demo name="Button">
        <Cluster>
          <Button>Solid</Button>
          <Button variant="navy">Navy</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </Cluster>
        <Cluster>
          <Button size="sm">Mały</Button>
          <Button size="lg" magnetic rightIcon={<Icon name="arrowRight" size={20} />}>Magnetyczny lg</Button>
          <Button loading>Ładowanie</Button>
          <Button disabled>Wyłączony</Button>
          <Button to="/wydarzenia" variant="soft" leftIcon={<Icon name="calendar" size={20} />}>Router Link</Button>
          <Button href="https://example.com" variant="outline">Zewnętrzny</Button>
        </Cluster>
      </Demo>
      <Demo name="IconButton">
        <Cluster>
          <IconButton label="Powiadomienia (są nowe)" badge variant="soft"><Icon name="bell" /></IconButton>
          <IconButton label="Filtruj" variant="solid"><Icon name="filter" /></IconButton>
          <IconButton label="Menu" variant="navy"><Icon name="menu" /></IconButton>
          <IconButton label="Szukaj" variant="glass"><Icon name="search" /></IconButton>
        </Cluster>
      </Demo>
      <Demo name="Heading / Text / Eyebrow / Link">
        <Eyebrow>Eyebrow</Eyebrow>
        <Heading level={2} size="2xl">Nagłówek 2xl <span className="font-serif font-normal italic text-accent-ink">z akcentem</span></Heading>
        <Heading level={3} size="md">Poziom 3, rozmiar md</Heading>
        <Text variant="lead">Lead — wprowadzenie do artykułu.</Text>
        <Text>Body — zwykły tekst akapitu w kolorze ink.</Text>
        <Text variant="meta">Meta · 12.11.2026 | Autor</Text>
        <Text variant="caption">Caption — podpis.</Text>
        <Text><Link to="/aktualnosci">Link wewnętrzny</Link> · <Link to="https://example.com">Link zewnętrzny</Link></Text>
      </Demo>
      <Demo name="Badge / DatePill / Avatar">
        <Cluster>
          <Badge>Neutral</Badge><Badge tone="accent">Accent</Badge><Badge tone="navy">Navy</Badge>
          <Badge tone="success">Success</Badge><Badge tone="danger">Danger</Badge>
          <DatePill>Jutro, 19:30</DatePill>
          <Avatar name="Jan Kowalski" /><Avatar name="Parafia św. Jana" size={56} />
        </Cluster>
      </Demo>
      <Demo name="Chip / ChipGroup">
        <Chip pressed={pressed} onPressedChange={setPressed}>Przełącznik</Chip>
        <ChipGroup
          label="Autor"
          allowClear
          value={author}
          onChange={setAuthor}
          options={[{ value: "a", label: "Archidiecezja" }, { value: "b", label: "Młodzież" }, { value: "c", label: "Caritas" }]}
        />
      </Demo>
      <Demo name="Card (interactive / tilt / link) + SmartImage">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card interactive className="p-5"><Text>Interactive — lift on hover.</Text></Card>
          <Card tilt className="p-5"><Text>Tilt 3D z odblaskiem (mysz).</Text></Card>
          <Card to="/aktualnosci" linkLabel="Przejdź do aktualności">
            <SmartImage src={IMG} alt="Zastępczy obraz" aspect="16/9" zoomOnHover />
            <p className="p-4 font-bold text-navy">Karta jako link (obraz z fallbackiem)</p>
          </Card>
        </div>
      </Demo>
      <Demo name="Skeleton / SkeletonCard">
        <Skeleton className="h-6 w-1/2" />
        <div className="grid gap-4 sm:grid-cols-3"><SkeletonCard /><SkeletonCard className="hidden sm:block" /></div>
      </Demo>
      <Demo name="Divider / JednoLogo">
        <Divider />
        <Cluster gap={8}><JednoLogo animated size={56} /><JednoLogo variant="mark" size={48} /></Cluster>
      </Demo>
      <Demo name={`Icon (${iconNames.length})`}>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {iconNames.map((n) => (
            <li key={n} className="flex flex-col items-center gap-1 rounded-xl bg-surface-muted p-3 text-navy">
              <Icon name={n} />
              <span className="text-xs text-ink-muted">{n}</span>
            </li>
          ))}
        </ul>
      </Demo>
    </Group>
  );
}
