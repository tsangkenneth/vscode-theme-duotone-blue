import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { variants } from "./palettes/duotone-blue.ts";
import {
  generateTheme,
  manifestThemes,
  themeFileName,
  toJson,
} from "./theme.ts";

const themesDirectory = new URL("../themes/", import.meta.url);
const packageJsonFile = new URL("../package.json", import.meta.url);

const syncPackageJson = async () => {
  const original = await readFile(packageJsonFile, "utf8");
  const packageJson = JSON.parse(original);
  packageJson.contributes = {
    ...packageJson.contributes,
    themes: manifestThemes(variants),
  };
  const updated = toJson(packageJson);
  if (updated !== original) {
    await writeFile(packageJsonFile, updated);
  }
};

const removeStaleThemes = async () => {
  const currentThemes = new Set(variants.map(themeFileName));
  for (const name of await readdir(themesDirectory)) {
    if (name.endsWith(".json") && !currentThemes.has(name)) {
      await rm(new URL(name, themesDirectory));
    }
  }
};

await mkdir(themesDirectory, { recursive: true });
await Promise.all([
  ...variants.map((variant) =>
    writeFile(
      new URL(themeFileName(variant), themesDirectory),
      toJson(generateTheme(variant)),
    )
  ),
  syncPackageJson(),
  removeStaleThemes(),
]);
console.log(`Generated ${variants.length} themes`);
