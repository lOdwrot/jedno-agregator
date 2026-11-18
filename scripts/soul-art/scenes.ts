import type { Scene } from "./scene";
import { PARISH_PEOPLE } from "./parishPeople";
import { PARISH_THINGS } from "./parishThings";
import { DEMON_CHARS } from "./demonChars";
import { DEMON_THINGS } from "./demonThings";

/** Every drawn card picture, keyed by card id. */
export const SCENES: Record<string, Scene> = {
  ...PARISH_PEOPLE,
  ...PARISH_THINGS,
  ...DEMON_CHARS,
  ...DEMON_THINGS,
};
