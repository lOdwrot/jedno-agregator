import { motion } from "motion/react";
import { paths } from "@/app/routes";
import { usePageTitle } from "@/lib/seo";
import {
  AnimatedBlobs,
  BrushUnderline,
  Button,
  Container,
  Grain,
  Icon,
  JednoLogo,
  Reveal,
  SplitText,
  Spotlight,
  Text,
  usePrefersReducedMotion,
} from "@/ui";

/** Playful 404: the "0" is the Jedno mark, whose figures drift apart when you hover. */
export function NotFoundPage() {
  usePageTitle("Nie znaleziono strony");
  const reduce = usePrefersReducedMotion();
  return (
    <Spotlight className="relative isolate overflow-hidden">
      <AnimatedBlobs />
      <Grain />
      <Container className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-16 text-center">
        <p aria-hidden="true" className="flex items-center font-display text-[clamp(6rem,24vw,13rem)] font-extrabold leading-none text-navy">
          <span>4</span>
          <motion.span
            className="mx-1 inline-flex"
            animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <JednoLogo variant="mark" animated size={140} className="sm:scale-125" />
          </motion.span>
          <span>4</span>
        </p>
        <h1 className="font-display text-3xl font-extrabold text-navy sm:text-5xl">
          <SplitText text="Tej strony" delay={0.3} /> <BrushUnderline><span className="font-serif font-normal italic">tu nie ma</span></BrushUnderline>
        </h1>
        <Reveal delay={0.5}>
          <Text variant="lead" className="max-w-md text-ink-muted">
            Wygląda na to, że ten adres się zgubił. Wróć na start i znajdź to, czego szukasz.
          </Text>
        </Reveal>
        <Reveal delay={0.7} className="flex flex-wrap justify-center gap-3">
          <Button to={paths.home} magnetic size="lg" leftIcon={<Icon name="home" size={20} />}>
            Wróć na stronę główną
          </Button>
          <Button to={paths.events} variant="outline" size="lg">
            Zobacz wydarzenia
          </Button>
        </Reveal>
      </Container>
    </Spotlight>
  );
}
