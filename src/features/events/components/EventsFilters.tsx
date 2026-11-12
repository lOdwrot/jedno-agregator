import { useState } from "react";
import { Button, Icon, IconButton, Select, Sheet } from "@/ui";

export interface FilterValues {
  tag: string;
  author: string;
}

interface Props {
  tags: string[];
  authors: string[];
  value: FilterValues;
  onChange: (next: FilterValues) => void;
}

const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

/** Inline selects (md+). */
export function InlineFilters({ tags, authors, value, onChange }: Props) {
  return (
    <div className="hidden items-end gap-4 md:flex" role="group" aria-label="Filtry wydarzeń">
      <Select
        label="Kategoria"
        placeholder="Wszystkie"
        options={toOptions(tags)}
        value={value.tag}
        onChange={(tag) => onChange({ ...value, tag })}
        className="w-60"
      />
      <Select
        label="Autor"
        placeholder="Wszyscy autorzy"
        options={toOptions(authors)}
        value={value.author}
        onChange={(author) => onChange({ ...value, author })}
        className="w-72"
      />
      {(value.tag || value.author) && (
        <Button variant="ghost" onClick={() => onChange({ tag: "", author: "" })} leftIcon={<Icon name="close" size={18} />}>
          Wyczyść
        </Button>
      )}
    </div>
  );
}

/** Mobile: filter button + bottom sheet with pending state. */
export function MobileFilters({ tags, authors, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<FilterValues>(value);
  const active = (value.tag ? 1 : 0) + (value.author ? 1 : 0);

  const openSheet = () => {
    setPending(value);
    setOpen(true);
  };
  return (
    <div className="md:hidden">
      <IconButton
        label={active ? `Filtruj wydarzenia, aktywne filtry: ${active}` : "Filtruj wydarzenia"}
        variant="soft"
        badge={active > 0}
        onClick={openSheet}
        aria-haspopup="dialog"
      >
        <Icon name="filter" />
      </IconButton>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filtruj wydarzenia">
        <div className="flex flex-col gap-5">
          <Select
            label="Kategoria"
            placeholder="Wszystkie"
            options={toOptions(tags)}
            value={pending.tag}
            onChange={(tag) => setPending((p) => ({ ...p, tag }))}
          />
          <Select
            label="Autor"
            placeholder="Wszyscy autorzy"
            options={toOptions(authors)}
            value={pending.author}
            onChange={(author) => setPending((p) => ({ ...p, author }))}
          />
          <div className="flex flex-col gap-2 pt-2">
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                onChange(pending);
                setOpen(false);
              }}
            >
              Zastosuj filtry
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setPending({ tag: "", author: "" })}>
              Wyczyść
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
