import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { HomePage } from "@/features/home/pages/HomePage";

/**
 * Routes. Home is bundled eagerly (first paint); every other page is code-split with
 * react-router's `lazy` — the router fetches the chunk before navigating.
 * To add a page: create it under src/features/<f>/pages, add a path helper in ./routes.ts,
 * and register it here with `lazy: page(() => import(...), "ExportName")`.
 */
function page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M) {
  return async () => ({ Component: (await load())[name] as React.ComponentType });
}

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: "aktualnosci",
          lazy: page(() => import("@/features/news/pages/NewsListPage"), "NewsListPage"),
        },
        {
          path: "aktualnosci/:id",
          lazy: page(() => import("@/features/news/pages/NewsDetailPage"), "NewsDetailPage"),
        },
        {
          path: "wydarzenia",
          lazy: page(() => import("@/features/events/pages/EventsListPage"), "EventsListPage"),
        },
        {
          path: "wydarzenia/:id",
          lazy: page(() => import("@/features/events/pages/EventDetailPage"), "EventDetailPage"),
        },
        {
          path: "spolecznosci",
          lazy: page(
            () => import("@/features/communities/pages/CommunitiesPage"),
            "CommunitiesPage",
          ),
        },
        {
          path: "media",
          lazy: page(() => import("@/features/media/pages/MediaPage"), "MediaPage"),
        },
        {
          path: "media/instagram",
          lazy: page(() => import("@/features/media/pages/MediaPage"), "MediaPage"),
        },
        {
          path: "info/:slug",
          lazy: page(() => import("@/features/infos/pages/InfoPage"), "InfoPage"),
        },
        { path: "ui", lazy: page(() => import("@/ui/catalog/UiCatalogPage"), "UiCatalogPage") },
        { path: "*", lazy: page(() => import("./NotFoundPage"), "NotFoundPage") },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") },
);
