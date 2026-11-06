import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readJson = async (path: string) =>
  JSON.parse(await readFile(new URL(path, root), "utf8"));

const luminance = (hex: string): number => {
  const channels = hex.slice(1).match(/.{2}/g);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }
  const [red, green, blue] = channels.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (foreground: string, background: string): number => {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

const packageJson = await readJson("package.json");
const contributions = packageJson.contributes?.themes;
assert(Array.isArray(contributions), "package.json must contribute theme entries");
assert(contributions.length === 2, "Expected exactly two theme variants");

for (const contribution of contributions) {
  const themePath = contribution.path.replace(/^\.\//, "");
  const theme = await readJson(themePath);
  assert(theme.name === contribution.label, `${themePath}: label does not match`);
  assert(
    theme.type === (contribution.uiTheme === "vs-dark" ? "dark" : "light"),
    `${themePath}: theme type does not match its UI contribution`,
  );
  assert(theme.semanticHighlighting === true, `${themePath}: semantic highlighting is off`);
  assert(Array.isArray(theme.tokenColors), `${themePath}: tokenColors must be an array`);

  const editorBackground = theme.colors["editor.background"];
  const editorForeground = theme.colors["editor.foreground"];
  assert(
    contrast(editorForeground, editorBackground) >= 4.5,
    `${themePath}: editor text contrast is below 4.5:1`,
  );
  assert(
    contrast(theme.tokenColors[0].settings.foreground, editorBackground) >= 4.5,
    `${themePath}: default token text contrast is below 4.5:1`,
  );

  const contrastPairs = [
    ["editor selection", "editor.selectionForeground", "editor.selectionBackground"],
    ["find match", "editor.findMatchForeground", "editor.findMatchBackground"],
    ["list selection", "list.activeSelectionForeground", "list.activeSelectionBackground"],
    [
      "inactive list selection",
      "list.inactiveSelectionForeground",
      "list.inactiveSelectionBackground",
    ],
    ["menu selection", "menu.selectionForeground", "menu.selectionBackground"],
    ["button", "button.foreground", "button.background"],
    ["badge", "badge.foreground", "badge.background"],
    ["status bar", "statusBar.foreground", "statusBar.background"],
  ];
  for (const [label, foregroundKey, backgroundKey] of contrastPairs) {
    assert(
      contrast(theme.colors[foregroundKey], theme.colors[backgroundKey]) >= 4.5,
      `${themePath}: ${label} contrast is below 4.5:1`,
    );
  }
  assert(
    theme.colors["statusBar.background"] === editorBackground,
    `${themePath}: status bar should blend with the editor background`,
  );
  assert(
    luminance(theme.colors["editorGroupHeader.tabsBackground"]) <
      luminance(editorBackground),
    `${themePath}: tab strip should be darker than the active tab`,
  );
  assert(
    contrast(
      theme.colors["activityBar.background"],
      theme.colors["activityBar.activeBackground"],
    ) >= 1.5,
    `${themePath}: active activity-bar item needs a more distinct background`,
  );
  assert(
    contrast(
      theme.colors["activityBar.foreground"],
      theme.colors["activityBar.activeBackground"],
    ) >= 2.6,
    `${themePath}: active activity-bar icon contrast is below 2.6:1`,
  );
  assert(
    theme.colors["tab.border"] === "#0000" &&
      theme.colors["tab.unfocusedActiveBorder"] === "#0000",
    `${themePath}: tabs should not draw boxed borders`,
  );
  assert(
    theme.colors["list.focusOutline"] === "#0000" &&
      theme.colors["list.focusAndSelectionOutline"] === "#0000",
    `${themePath}: list focus states should use filled backgrounds, not outlines`,
  );
  assert(
    contrast(
      theme.colors["list.inactiveSelectionBackground"],
      theme.colors["sideBar.background"],
    ) >= 1.3,
    `${themePath}: unfocused list selection blends into the sidebar`,
  );
  const separatorPairs = [
    ["menu separators", "menu.separatorBackground", "menu.background"],
    ["quick pick group dividers", "pickerGroup.border", "quickInput.background"],
  ];
  for (const [label, separatorKey, backgroundKey] of separatorPairs) {
    assert(
      contrast(theme.colors[separatorKey], theme.colors[backgroundKey]) >= 1.4,
      `${themePath}: ${label} blend into their background`,
    );
  }
  const sideBarBackground = theme.colors["sideBar.background"];
  const sideBarTextContrast = contrast(
    theme.colors["sideBar.foreground"],
    sideBarBackground,
  );
  for (const state of ["added", "untracked"]) {
    assert(
      contrast(
        theme.colors[`gitDecoration.${state}ResourceForeground`],
        sideBarBackground,
      ) > sideBarTextContrast,
      `${themePath}: ${state} files should stand out more than sidebar text`,
    );
  }
  const deleted = theme.colors["gitDecoration.deletedResourceForeground"];
  assert(
    deleted !== theme.colors["gitDecoration.modifiedResourceForeground"] &&
      contrast(deleted, sideBarBackground) >= 4.5,
    `${themePath}: deleted files should differ from modified files and stay readable`,
  );
  assert(
    theme.colors["editorGutter.deletedBackground"] === deleted,
    `${themePath}: the gutter's deleted-line marker should match deleted files`,
  );
  const ignoredContrast = contrast(
    theme.colors["gitDecoration.ignoredResourceForeground"],
    sideBarBackground,
  );
  assert(
    ignoredContrast < sideBarTextContrast && ignoredContrast >= 2.5,
    `${themePath}: ignored files should be dimmer than sidebar text but stay readable`,
  );
  assert(
    !("contrastActiveBorder" in theme.colors),
    `${themePath}: contrastActiveBorder outlines activity-bar items, panel tabs and list rows`,
  );
  assert(
    theme.colors.focusBorder === theme.colors["sideBar.background"],
    `${themePath}: focus border should blend into sidebar controls`,
  );
  assert(
    theme.colors["list.focusBackground"] ===
      theme.colors["list.activeSelectionBackground"],
    `${themePath}: focused list rows should be indicated by a filled background`,
  );
  for (let index = 1; index <= 6; index += 1) {
    assert(
      contrast(
        theme.colors[`editorBracketHighlight.foreground${index}`],
        editorBackground,
      ) >= 4.5,
      `${themePath}: bracket color ${index} contrast is below 4.5:1`,
    );
  }
  for (const [colorName, color] of Object.entries(theme.colors)) {
    if (
      !colorName.startsWith("terminal.ansi") ||
      colorName === "terminal.ansiBlack"
    ) continue;
    assert(
      contrast(color, theme.colors["terminal.background"]) >= 4.5,
      `${themePath}: ${colorName} contrast is below 4.5:1`,
    );
  }

  const comment = theme.tokenColors.find((entry: {
    scope?: string | string[];
  }) =>
    Array.isArray(entry.scope)
      ? entry.scope.includes("comment")
      : entry.scope === "comment"
  );
  assert(comment, `${themePath}: missing comment token rule`);
  assert(
    comment.settings.fontStyle?.includes("italic"),
    `${themePath}: comments should remain italic`,
  );
  assert(
    contrast(comment.settings.foreground, editorBackground) >= 4.5,
    `${themePath}: comment contrast is below 4.5:1`,
  );

  const tokenForegrounds = theme.tokenColors.flatMap((entry: {
    settings: { foreground?: string };
  }) => entry.settings.foreground ? [entry.settings.foreground] : []);
  assert(
    tokenForegrounds.every((foreground: string) =>
      contrast(foreground, editorBackground) >= 2.6
    ),
    `${themePath}: a syntax foreground falls below 2.6:1 contrast`,
  );
}

console.log(`Validated ${contributions.length} generated themes`);
