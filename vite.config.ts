/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages serves the site from /<repo>/
const BASE = "/jedno-agregator/";

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
  // vendor chunk (react-router + motion) is ~140 kB gzip; pages are code-split
  build: { chunkSizeWarningLimit: 700 },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    css: false,
  },
});
