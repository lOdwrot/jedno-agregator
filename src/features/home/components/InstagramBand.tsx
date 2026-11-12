import { useMediaMeta } from "@/features/media/api";
import { AnimatedBlobs, Button, Container, Grain, Heading, Icon, Reveal } from "@/ui";

const FALLBACK_URL = "https://www.instagram.com/archigdansk/";

/** Gradient call-to-action band for the Instagram profile. */
export function InstagramBand() {
  const meta = useMediaMeta();
  const url = meta.data?.instagramUrl ?? FALLBACK_URL;
  return (
    <Container className="py-8 sm:py-10">
      <Reveal>
        <section
          aria-labelledby="home-instagram"
          className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-logo-blue to-logo-red px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16"
        >
          <AnimatedBlobs className="opacity-40" />
          <Grain opacity={0.08} />
          <Icon
            name="instagram"
            size={320}
            strokeWidth={1}
            className="pointer-events-none absolute -right-10 -bottom-16 -z-10 rotate-12 text-white/15"
          />
          <p className="mb-3 text-sm font-bold tracking-widest text-white/90 uppercase">
            Instagram
          </p>
          <Heading level={2} size="2xl" tone="light" id="home-instagram" className="max-w-2xl">
            Śledź nas na Instagramie{" "}
            <span className="font-serif font-normal text-logo-yellow italic">@archigdansk</span>
          </Heading>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Codzienne zdjęcia, relacje z wydarzeń i krótkie myśli z życia archidiecezji.
          </p>
          <div className="mt-8">
            <Button
              href={url}
              size="lg"
              variant="solid"
              magnetic
              leftIcon={<Icon name="instagram" size={22} />}
            >
              Obserwuj @archigdansk
            </Button>
          </div>
        </section>
      </Reveal>
    </Container>
  );
}
