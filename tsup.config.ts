import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  outDir: "dist",
  outExtension: () => ({ js: ".mjs" }),
  clean: true,
  splitting: false,
  sourcemap: true,
});
