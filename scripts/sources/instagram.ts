import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { InstagramPostSchema, type InstagramPost } from "../../src/data/schemas.ts";

export const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/archigdansk/";
export const INSTAGRAM_FILE = join(process.cwd(), "content", "instagram", "posts.json");

/** Reads the hand-maintained content/instagram/posts.json ([{url, caption}]). No scraping. */
export async function loadInstagram(file = INSTAGRAM_FILE): Promise<InstagramPost[]> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  const json: unknown = JSON.parse(raw);
  if (!Array.isArray(json)) throw new Error("content/instagram/posts.json must be an array");
  return json.map((item, i) => {
    const rec = (item ?? {}) as Record<string, unknown>;
    const parsed = InstagramPostSchema.safeParse({
      url: typeof rec.url === "string" ? rec.url.trim() : rec.url,
      caption: typeof rec.caption === "string" ? rec.caption : null,
    });
    if (!parsed.success) throw new Error(`posts.json[${i}] invalid: ${parsed.error.message}`);
    return parsed.data;
  });
}
