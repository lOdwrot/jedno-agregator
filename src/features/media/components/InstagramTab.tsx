import { EmptyState, ErrorState, Icon, InstagramEmbed, Reveal, Skeleton, Button, Heading, Text } from "@/ui";
import { useInstagramPosts, useMediaMeta } from "../api";
import { MosaicDecor } from "./MosaicDecor";

const FALLBACK_PROFILE = "https://www.instagram.com/archigdansk/";

export function InstagramTab() {
  const postsQ = useInstagramPosts();
  const metaQ = useMediaMeta();
  const profileUrl = metaQ.data?.instagramUrl ?? FALLBACK_PROFILE;
  const follow = (
    <Button href={profileUrl} size="lg" magnetic rightIcon={<Icon name="externalLink" size={20} />}>
      Obserwuj na Instagramie
    </Button>
  );

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <section
          aria-labelledby="ig-title"
          className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-card bg-linear-to-br from-logo-orange via-logo-red to-logo-blue p-6 text-white sm:flex-row sm:items-center sm:p-10"
        >
          <span aria-hidden="true" className="absolute -right-10 -top-10 -z-10 size-56 rounded-full bg-logo-yellow/40 blur-2xl" />
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <Icon name="instagram" size={30} />
            </span>
            <div>
              <Heading level={2} size="xl" tone="light" id="ig-title">
                @archigdansk
              </Heading>
              <Text className="text-white">Archidiecezja Gdańska na Instagramie</Text>
            </div>
          </div>
          <Button href={profileUrl} variant="navy" size="lg" rightIcon={<Icon name="externalLink" size={20} />}>
            Obserwuj na Instagramie
          </Button>
        </section>
      </Reveal>

      {postsQ.isPending ? (
        <div role="status" aria-label="Ładowanie postów" className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="mb-4 h-96 rounded-card" />
          ))}
        </div>
      ) : postsQ.isError ? (
        <ErrorState message="Nie udało się wczytać postów." onRetry={() => void postsQ.refetch()} />
      ) : postsQ.data.length === 0 ? (
        <div className="relative overflow-hidden rounded-card bg-surface shadow-card">
          <MosaicDecor />
          <EmptyState
            icon="instagram"
            title="Wkrótce pojawią się tu wybrane posty"
            description="Wybrane wpisy z profilu @archigdansk będziemy pokazywać w tym miejscu. Tymczasem zajrzyj bezpośrednio na nasz profil."
            action={follow}
          />
        </div>
      ) : (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {postsQ.data.map((p, i) => (
            <li key={p.url} className="mb-4 break-inside-avoid">
              <Reveal delay={(i % 3) * 0.08}>
                <InstagramEmbed url={p.url} caption={p.caption ?? undefined} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
