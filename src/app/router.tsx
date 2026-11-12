import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { HomePage } from "@/features/home/pages/HomePage";
import { NewsListPage } from "@/features/news/pages/NewsListPage";
import { NewsDetailPage } from "@/features/news/pages/NewsDetailPage";
import { EventsListPage } from "@/features/events/pages/EventsListPage";
import { EventDetailPage } from "@/features/events/pages/EventDetailPage";
import { CommunitiesPage } from "@/features/communities/pages/CommunitiesPage";
import { MediaPage } from "@/features/media/pages/MediaPage";
import { InfoPage } from "@/features/infos/pages/InfoPage";
import { NotFoundPage } from "./NotFoundPage";
import { UiCatalogPage } from "@/ui/catalog/UiCatalogPage";

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "aktualnosci", element: <NewsListPage /> },
        { path: "aktualnosci/:id", element: <NewsDetailPage /> },
        { path: "wydarzenia", element: <EventsListPage /> },
        { path: "wydarzenia/:id", element: <EventDetailPage /> },
        { path: "spolecznosci", element: <CommunitiesPage /> },
        { path: "media", element: <MediaPage /> },
        { path: "media/instagram", element: <MediaPage /> },
        { path: "info/:slug", element: <InfoPage /> },
        { path: "ui", element: <UiCatalogPage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") },
);
