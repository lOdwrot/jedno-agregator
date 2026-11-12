const MAP: Record<string, string> = { ł: "l", Ł: "l", đ: "d", ø: "o", ß: "ss", æ: "ae", œ: "oe" };

/** "Dołącz jako Autor!" -> "dolacz-jako-autor". Polish diacritics -> ascii, kebab-case. */
export function slugify(input: string): string {
  return input
    .replace(/[łŁđøßæœ]/g, (c) => MAP[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
