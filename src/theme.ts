import { getTokenColors } from "./syntax/tokens.ts";
import { getSemanticTokenColors } from "./syntax/semantic.ts";
import { getBaseColors } from "./ui/base.ts";
import type { ThemeConfig } from "./types.ts";

export const generateTheme = (config: ThemeConfig) => ({
  $schema: "vscode://schemas/color-theme",
  name: config.label,
  type: config.type,
  colors: getBaseColors(config),
  tokenColors: getTokenColors(config.syntax),
  semanticHighlighting: true,
  semanticTokenColors: getSemanticTokenColors(config.syntax),
});

export const toJson = (value: unknown): string =>
  `${JSON.stringify(value, undefined, 2)}\n`;

export const themeFileName = ({ id }: ThemeConfig): string => `${id}.json`;

export const manifestThemes = (themes: ThemeConfig[]) =>
  themes.map((theme) => ({
    label: theme.label,
    uiTheme: theme.type === "dark" ? "vs-dark" : "vs",
    path: `./themes/${themeFileName(theme)}`,
  }));
