/** Data hooks for media: YouTube videos and curated Instagram posts. */
import { useSnapshot } from "@/data/useSnapshot";

/** YouTube videos, newest first (archive accumulates over time). */
export function useVideos(limit?: number) {
  return useSnapshot("videos", { select: (v) => (limit ? v.slice(0, limit) : v) });
}

/** Instagram post permalinks from content/instagram/posts.json (may be empty). */
export function useInstagramPosts() {
  return useSnapshot("instagram");
}

/** Channel/profile links + data freshness. */
export function useMediaMeta() {
  return useSnapshot("meta", {
    select: (m) => ({
      channelUrl: m.youtube.channelUrl,
      instagramUrl: m.instagram.profileUrl,
      generatedAt: m.generatedAt,
    }),
  });
}
