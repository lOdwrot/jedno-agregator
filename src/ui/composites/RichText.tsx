import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { splitRichContent } from "@/lib/html";
import { YouTubeEmbed } from "./YouTubeEmbed";

const PROSE = [
  "text-ink text-base leading-relaxed sm:text-[1.0625rem] sm:leading-[1.75]",
  "[&_p]:mb-4 [&_div]:mb-2",
  "[&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words hover:[&_a]:no-underline",
  "[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline",
  "[&_h1]:font-display [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight",
  "[&_h2]:font-display [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight",
  "[&_h3]:font-display [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-snug",
  "[&_h4]:font-display [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-bold",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1.5 [&_li]:pl-1",
  "[&_blockquote]:border-accent [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:pl-5 [&_blockquote]:font-serif [&_blockquote]:text-xl [&_blockquote]:italic",
  "[&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl",
  "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-current/15",
  "[&_table]:mb-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_td]:border [&_td]:border-current/15 [&_td]:p-2 [&_th]:border [&_th]:border-current/15 [&_th]:p-2",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
].join(" ");

export function RichText({ html, className }: { html: string; className?: string }) {
  const segments = useMemo(() => splitRichContent(html), [html]);
  if (segments.length === 0) return null;
  return (
    <div className={cn("min-w-0", className)}>
      {segments.map((seg, i) =>
        seg.type === "html" ? (
          <div key={i} className={PROSE} dangerouslySetInnerHTML={{ __html: seg.html }} />
        ) : (
          <YouTubeEmbed key={i} videoId={seg.videoId} title={seg.title} className="my-6" />
        ),
      )}
    </div>
  );
}
