import { useMemo } from "react";
import type { Partner } from "@/data/schemas";
import { Badge, Button, Dialog, Icon, RichText, Stack } from "@/ui";
import { extractLinks } from "../links";
import { CommunityLogo } from "./CommunityLogo";

/** `partner` stays set while the dialog animates out; `open` controls visibility. */
export function CommunityDialog({
  partner,
  open,
  onClose,
}: {
  partner: Partner | null;
  open: boolean;
  onClose: () => void;
}) {
  const links = useMemo(() => (partner ? extractLinks(partner.html) : []), [partner]);
  return (
    <Dialog open={open} onClose={onClose} title={partner?.name ?? "Społeczność"} size="lg">
      {partner && (
        <Stack gap={6}>
          <div className="flex items-center gap-4">
            <CommunityLogo name={partner.name} src={partner.imageUrl} size={96} />
            {partner.category && <Badge tone="accent">{partner.category}</Badge>}
          </div>
          <RichText html={partner.html} />
          {links.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-widest text-ink-muted uppercase">
                Linki
              </h3>
              <ul className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Button
                      href={l.href}
                      variant="soft"
                      size="sm"
                      rightIcon={<Icon name="arrowUpRight" size={16} />}
                      className="max-w-full break-all"
                    >
                      {l.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Stack>
      )}
    </Dialog>
  );
}
