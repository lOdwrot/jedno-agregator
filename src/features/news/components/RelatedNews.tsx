import { RevealGroup, RevealItem, Section } from "@/ui";
import { paths } from "@/app/routes";
import { useLatestNews } from "../api";
import { NewsCard } from "./NewsCard";

/** "Czytaj także" — three latest items other than the current one. */
export function RelatedNews({ currentId }: { currentId: number }) {
  const { data } = useLatestNews(5);
  const items = (data ?? []).filter((n) => n.id !== currentId).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <Section title="Czytaj także" action={{ label: "Wszystkie aktualności", to: paths.news }}>
      <RevealGroup as="ul" className="grid list-none gap-6 p-0 md:grid-cols-3">
        {items.map((n, i) => (
          <RevealItem as="li" key={n.id}>
            <NewsCard item={n} index={i} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
