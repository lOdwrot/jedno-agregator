import { AnimatedBlobs, Button, Grain, Heading, Icon, Reveal, Text } from "@/ui";

/** Big YouTube subscribe band. */
export function ChannelCta({ href }: { href: string }) {
  return (
    <Reveal>
      <section
        aria-labelledby="cta-title"
        className="relative isolate overflow-hidden rounded-card bg-navy px-6 py-10 text-center text-white sm:px-12 sm:py-14"
      >
        <AnimatedBlobs />
        <Grain opacity={0.08} />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-accent text-white shadow-glow">
            <Icon name="youtube" size={32} />
          </span>
          <Heading level={2} size="xl" tone="light" id="cta-title">
            Subskrybuj kanał <span className="font-serif font-normal italic text-logo-yellow">@ArchiGdansk</span>
          </Heading>
          <Text className="text-white/80">Rozmowy, relacje, homilie i świadectwa — nowe filmy co tydzień.</Text>
          <Button href={href} size="lg" magnetic rightIcon={<Icon name="externalLink" size={20} />}>
            Subskrybuj na YouTube
          </Button>
        </div>
      </section>
    </Reveal>
  );
}
