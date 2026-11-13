/**
 * Smoke + accessibility tests for every route. Requires `npm run build` with data in public/data.
 * IDs are read from the snapshot so the test follows live content.
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const read = <T>(name: string): T =>
  JSON.parse(readFileSync(`public/data/${name}.json`, "utf8")) as T;
const events = read<{ id: number }[]>("events");
const news = read<{ id: number }[]>("news");
const infos = read<{ slug: string }[]>("infos");

const routes: [string, string][] = [
  ["start", ""],
  ["aktualności", "aktualnosci"],
  ["wydarzenia", "wydarzenia"],
  ["kalendarz", "wydarzenia?widok=kalendarz"],
  ["społeczności", "spolecznosci"],
  ["media", "media"],
  ["instagram", "media/instagram"],
  ["gry", "gry"],
  ["gra: dawid i goliat", "gry/dawid-i-goliat"],
  ["gra: morze czerwone", "gry/morze-czerwone"],
  ["gra: arka noego", "gry/arka-noego"],
  ["gra: walka o duszę", "gry/walka-o-dusze"],
  ["404", "nie-ma-takiej-strony"],
];
if (news[0]) routes.push(["aktualność", `aktualnosci/${news[0].id}`]);
if (events[0]) routes.push(["wydarzenie", `wydarzenia/${events[0].id}`]);
if (infos[0]) routes.push(["info", `info/${infos[0].slug}`]);

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  // scroll through the page so in-view reveals / lazy images run
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

for (const [name, path] of routes) {
  test(`${name}: renders with one h1, no errors, no a11y violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      // third-party embeds (YouTube/Instagram) may log their own noise
      if (
        m.type() === "error" &&
        !/youtube|instagram|ytimg|Failed to load resource/i.test(m.text())
      )
        errors.push(m.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await settle(page);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("iframe")
      .analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(" "))
          .join(" | ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("navigation reaches every section", async ({ page }) => {
  await page.goto("");
  for (const label of ["Aktualności", "Wydarzenia", "Społeczności", "Media"]) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: label, exact: true })
      .first()
      .click();
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("skip link moves focus to main", async ({ page }) => {
  await page.goto("");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Przejdź do treści" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("games are playable with the keyboard", async ({ page }) => {
  await page.goto("gry/dawid-i-goliat");
  await page.getByRole("button", { name: "Zaczynamy!" }).click();
  await expect(page.getByRole("application")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByText("4 z 5")).toBeAttached();

  await page.goto("gry/morze-czerwone");
  await page.getByRole("button", { name: "Uciekamy!" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Tor w lewo" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Tor w prawo" })).toBeEnabled();

  await page.goto("gry/arka-noego");
  const first = page.getByRole("button", { name: /^Karta 1:/ });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).not.toHaveAccessibleName(/zakryta/);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: /^Karta 2:/ })).toBeFocused();
});
