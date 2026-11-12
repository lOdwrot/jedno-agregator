import { useState } from "react";
import { Button, ChipGroup, Cluster, IconButton, Icon, Select, Sheet } from "@/ui";

interface NewsFiltersProps {
  authors: string[];
  author: string | null;
  onChange: (author: string | null) => void;
}

/** Desktop: chip row. Mobile: filter icon button opening a Sheet with a pending selection. */
export function NewsFilters({ authors, author, onChange }: NewsFiltersProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string>(author ?? "");
  const options = authors.map((a) => ({ value: a, label: a }));

  const openSheet = () => {
    setPending(author ?? "");
    setOpen(true);
  };
  const apply = () => {
    onChange(pending || null);
    setOpen(false);
  };
  const clear = () => {
    setPending("");
    onChange(null);
    setOpen(false);
  };

  if (authors.length === 0) return null;
  return (
    <>
      <div className="hidden md:block">
        <ChipGroup label="Filtruj według autora" options={options} value={author} onChange={onChange} allowClear />
      </div>
      <div className="md:hidden">
        <IconButton label={author ? `Filtry (aktywny: ${author})` : "Filtry"} variant="soft" badge={!!author} onClick={openSheet} aria-haspopup="dialog">
          <Icon name="filter" />
        </IconButton>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filtruj aktualności">
        <div className="flex flex-col gap-6">
          <Select label="Autor" placeholder="Wszyscy autorzy" options={options} value={pending} onChange={setPending} />
          <Cluster gap={3}>
            <Button variant="solid" size="lg" onClick={apply} className="flex-1">
              Zastosuj filtry
            </Button>
            <Button variant="outline" size="lg" onClick={clear}>
              Wyczyść
            </Button>
          </Cluster>
        </div>
      </Sheet>
    </>
  );
}
