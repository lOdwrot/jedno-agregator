import { useLocation } from "react-router";
import { paths } from "@/app/routes";
import { usePageTitle } from "@/lib/seo";
import { Container, Icon, PageHeader, Tabs } from "@/ui";
import { InstagramTab } from "../components/InstagramTab";
import { VideosTab } from "../components/VideosTab";

export function MediaPage() {
  const { pathname } = useLocation();
  const isInstagram = pathname.replace(/\/$/, "").endsWith(paths.mediaInstagram);
  usePageTitle(isInstagram ? "Media · Instagram" : "Media · Filmy");

  return (
    <Container className="pb-16">
      <PageHeader
        title="Media"
        accent={isInstagram ? "z Instagrama" : "i filmy"}
        eyebrow="Archidiecezja Gdańska"
        description="Najnowsze filmy z kanału YouTube @ArchiGdansk oraz wybrane posty z Instagrama."
      />
      <Tabs
        label="Rodzaj mediów"
        value={isInstagram ? "instagram" : "filmy"}
        className="mb-6"
        items={[
          {
            value: "filmy",
            label: "Filmy",
            to: paths.media,
            icon: <Icon name="youtube" size={20} />,
          },
          {
            value: "instagram",
            label: "Instagram",
            to: paths.mediaInstagram,
            icon: <Icon name="instagram" size={20} />,
          },
        ]}
      />
      {isInstagram ? <InstagramTab /> : <VideosTab />}
    </Container>
  );
}
