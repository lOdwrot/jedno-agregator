import { usePageTitle } from "@/lib/seo";
import { CommunitiesMarquee } from "../components/CommunitiesMarquee";
import { GamesBand } from "../components/GamesBand";
import { Hero } from "../components/Hero";
import { InstagramBand } from "../components/InstagramBand";
import { NewsBento } from "../components/NewsBento";
import { UpcomingEvents } from "../components/UpcomingEvents";
import { VideosSection } from "../components/VideosSection";

export function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <UpcomingEvents />
      <NewsBento />
      <VideosSection />
      <CommunitiesMarquee />
      <GamesBand />
      <InstagramBand />
    </>
  );
}
