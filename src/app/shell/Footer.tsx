import { Link } from "react-router";
import { paths } from "@/app/routes";
import { useInfos } from "@/features/infos/api";
import { useMediaMeta } from "@/features/media/api";
import { formatRelativeAgo } from "@/lib/dates";
import { AnimatedBlobs, Container, Grain, Icon, Reveal } from "@/ui";
import { NAV_ITEMS } from "./nav";

const YOUTUBE_URL = "https://www.youtube.com/@ArchiGdansk";
const INSTAGRAM_URL = "https://www.instagram.com/archigdansk/";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 text-white/85 no-underline transition-colors hover:text-white hover:underline";
const headClass = "mb-2 text-xs font-bold uppercase tracking-widest text-white/70";

export function Footer() {
  const infos = useInfos();
  const meta = useMediaMeta();
  return (
    <footer className="relative isolate overflow-hidden bg-navy text-white">
      <AnimatedBlobs className="opacity-40" />
      <Grain opacity={0.08} />
      <Container className="relative py-14 sm:py-20">
        <Reveal>
          <p
            aria-hidden="true"
            className="select-none bg-gradient-to-r from-white via-white to-logo-yellow bg-clip-text font-display text-[22vw] font-extrabold leading-[0.85] tracking-tighter text-transparent sm:text-[16vw] lg:text-[11rem]"
          >
            Jedno
          </p>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Jedno — wszystko, co dzieje się w Kościele gdańskim, w jednym miejscu.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Nawigacja w stopce">
            <h2 className={headClass}>Serwis</h2>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Strony informacyjne">
            <h2 className={headClass}>Informacje</h2>
            <ul>
              {(infos.data ?? []).map((info) => (
                <li key={info.id}>
                  <Link to={paths.info(info.slug)} className={linkClass}>
                    {info.title}
                  </Link>
                </li>
              ))}
              {infos.data?.length === 0 && <li className="text-white/70">Brak stron informacyjnych.</li>}
            </ul>
          </nav>

          <div>
            <h2 className={headClass}>Obserwuj nas</h2>
            <ul>
              <li>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Icon name="youtube" size={20} />
                  YouTube
                  <span className="sr-only">(otwiera się w nowej karcie)</span>
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Icon name="instagram" size={20} />
                  Instagram
                  <span className="sr-only">(otwiera się w nowej karcie)</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={headClass}>Aplikacja</h2>
            <p className="text-white/85">
              Pobierz aplikację <strong className="text-white">Jedno</strong> na telefon — powiadomienia, wydarzenia
              i aktualności zawsze pod ręką.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jedno · Archidiecezja Gdańska</p>
          {meta.data && (
            <p>
              Dane zaktualizowane:{" "}
              <time dateTime={meta.data.generatedAt}>{formatRelativeAgo(meta.data.generatedAt)}</time>
            </p>
          )}
        </div>
      </Container>
    </footer>
  );
}
