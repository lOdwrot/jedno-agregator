/** "Walka o duszę" multiplayer lobby: reachable as a tab, accessible, code field accepts digits only. */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("walka o duszę: multiplayer lobby has no a11y violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("gry/walka-o-dusze");
  await page.getByRole("tab", { name: "Multiplayer" }).click();
  await expect(page.getByRole("heading", { name: /Pojedynek z przyjacielem/ })).toBeVisible();
  const code = page.getByRole("textbox", { name: "Kod gry" });
  await code.fill("12a34");
  await expect(code).toHaveValue("1234");
  await code.fill("12");
  await page.getByRole("button", { name: "Dołącz" }).click();
  await expect(page.getByRole("alert")).toHaveText("Kod gry to 4 cyfry.");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
});
