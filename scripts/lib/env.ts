import { existsSync } from "node:fs";
import { resolve } from "node:path";

/** Loads `.env` (if present) into process.env without overriding already-set variables. */
export function loadEnv(file = resolve(process.cwd(), ".env")): void {
  if (existsSync(file)) process.loadEnvFile(file);
}
