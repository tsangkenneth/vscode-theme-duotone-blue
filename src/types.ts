export type Hex = `#${string}`;

export type ColorScheme = "light" | "dark";

export type SyntaxColors = {
  text: Hex;
  comment: Hex;
  string: Hex;
  constant: Hex;
  definition: Hex;
  type: Hex;
  support: Hex;
  keyword: Hex;
  punctuation: Hex;
  invalid: Hex;
  deprecated: Hex;
};

export type ThemeConfig = {
  id: string;
  label: string;
  type: ColorScheme;
  palette: {
    background: Hex;
    foreground: Hex;
    uno: Record<"1" | "2" | "3" | "4", Hex> & Partial<Record<"0", Hex>>;
    duo: Record<"1" | "2" | "3", Hex>;
  };
  syntax: SyntaxColors;
  ui: {
    surface: Hex;
    raisedSurface: Hex;
    border: Hex;
    selection: Hex;
    selectionForeground: Hex;
    selectionGutter: Hex;
    guide: Hex;
    lineHighlight: Hex;
    accent: Hex;
    accentForeground: Hex;
    primaryButton: Hex;
    primaryButtonForeground: Hex;
    statusBar: Hex;
    statusBarForeground: Hex;
    activityBar: Hex;
    activityBarForeground: Hex;
    activityBarActiveBackground: Hex;
    tabStrip: Hex;
    bracketColors: [Hex, Hex, Hex, Hex, Hex, Hex];
  };
};

export type TokenColor = {
  name?: string;
  scope?: string | string[];
  settings: {
    foreground?: Hex;
    fontStyle?: string;
  };
};
