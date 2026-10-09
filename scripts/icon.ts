// Renders the extension icon to images/icon.png: "DUO" in the Duo colors above
// "TONE" in the Uno colors, on the dark variant's background. The letters are
// drawn as geometric paths rather than text, so both rows can be justified to
// the same width and the icon doesn't depend on installed fonts. Needs Chrome,
// Chromium or Edge.
//
// Usage: npm run icon -- [--chrome <path>]
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { variants } from "../src/palettes/duotone-blue.ts";
import { findChrome } from "./lib/chrome.ts";

const { values: options } = parseArgs({
  options: { chrome: { type: "string" } },
});

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const chrome = options.chrome ?? findChrome() ??
  fail("Could not find Chrome, Chromium or Edge; pass --chrome <path>");
const { palette } = variants.find(({ type }) => type === "dark") ??
  fail("No dark variant");

// Layout, in CSS pixels; the PNG is rendered at twice this size
const size = 256;
const margin = 52;
const rows = [
  {
    letters: "DUO",
    colors: [palette.duo[1], palette.duo[2], palette.duo[3]],
    height: 62,
  },
  {
    letters: "TONE",
    colors: [palette.uno[1], palette.uno[2], palette.uno[3], palette.uno[4]],
    height: 46.5,
  },
];
const rowGap = 16;
// Relative to the row's cap height
const letterGap = 0.22;
const weight = 0.155;
// Round letters extend slightly past the cap height and baseline so they look
// as tall as flat ones
const overshoot = 0.015;

type Box = { x: number; y: number; width: number; height: number };

const n = (value: number) => +value.toFixed(2);

// Each glyph draws strokes `stroke` wide whose outer edges meet the box
const glyphs: Record<
  string,
  (box: Box, stroke: number, color: string) => string
> = {
  D: ({ x, y, width, height }, stroke) => {
    const left = x + stroke / 2, right = x + width - stroke / 2;
    const top = y + stroke / 2, bottom = y + height - stroke / 2;
    const rx = (right - left) * 0.55;
    const ry = Math.min(rx * 1.2, (bottom - top) / 2);
    return `<path d="M${n(left)} ${n(top)}H${n(right - rx)}A${n(rx)} ${
      n(ry)
    } 0 0 1 ${n(right)} ${n(top + ry)}V${n(bottom - ry)}A${n(rx)} ${n(ry)} 0 0 1 ${
      n(right - rx)
    } ${n(bottom)}H${n(left)}Z"/>`;
  },
  E: ({ x, y, width, height }, stroke) => {
    const left = x + stroke / 2;
    const top = y + stroke / 2, bottom = y + height - stroke / 2;
    return `<path d="M${n(left)} ${n(y)}V${n(y + height)}M${n(left)} ${
      n(top)
    }H${n(x + width)}M${n(left)} ${n(y + height / 2)}H${
      n(x + width * 0.9)
    }M${n(left)} ${n(bottom)}H${n(x + width)}"/>`;
  },
  N: ({ x, y, width, height }, stroke, color) => {
    const left = x + stroke / 2, right = x + width - stroke / 2;
    // Horizontal width of the diagonal that makes it `stroke` thick
    let run = stroke;
    for (let i = 0; i < 8; i++) {
      run = stroke * Math.hypot(height, width - run) / height;
    }
    return `<path d="M${n(left)} ${n(y)}V${n(y + height)}M${n(right)} ${
      n(y)
    }V${n(y + height)}"/><path stroke="none" fill="${color}" d="M${n(x)} ${
      n(y)
    }H${n(x + run)}L${n(x + width)} ${n(y + height)}H${n(x + width - run)}Z"/>`;
  },
  O: ({ x, y, width, height }, stroke) => {
    const extra = height * overshoot;
    const left = x + stroke / 2, right = x + width - stroke / 2;
    const top = y + stroke / 2 - extra, bottom = y + height - stroke / 2 + extra;
    const rx = (right - left) / 2;
    return `<rect x="${n(left)}" y="${n(top)}" width="${n(right - left)}" height="${
      n(bottom - top)
    }" rx="${n(rx)}" ry="${n(Math.min(rx * 1.3, (bottom - top) / 2))}"/>`;
  },
  T: ({ x, y, width, height }, stroke) =>
    `<path d="M${n(x)} ${n(y + stroke / 2)}H${n(x + width)}M${
      n(x + width / 2)
    } ${n(y)}V${n(y + height)}"/>`,
  U: ({ x, y, width, height }, stroke) => {
    const left = x + stroke / 2, right = x + width - stroke / 2;
    const bottom = y + height - stroke / 2 + height * overshoot;
    const rx = (right - left) / 2, ry = rx * 1.2;
    return `<path d="M${n(left)} ${n(y)}V${n(bottom - ry)}A${n(rx)} ${
      n(ry)
    } 0 0 0 ${n(right)} ${n(bottom - ry)}V${n(y)}"/>`;
  },
};

const rowWidth = size - 2 * margin;
const blockHeight = rows.reduce((sum, { height }) => sum + height, 0) +
  rowGap * (rows.length - 1);
let rowTop = (size - blockHeight) / 2;
const letters = rows.flatMap(({ letters, colors, height }) => {
  const gap = height * letterGap;
  const stroke = height * weight;
  const width = (rowWidth - gap * (letters.length - 1)) / letters.length;
  const y = rowTop;
  rowTop += height + rowGap;
  return [...letters].map((letter, index) => {
    const box = { x: margin + index * (width + gap), y, width, height };
    const color = colors[index];
    return `<g stroke="${color}" stroke-width="${n(stroke)}">${
      glyphs[letter](box, stroke, color)
    }</g>`;
  });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" fill="${palette.background}"/>
<g fill="none">
${letters.join("\n")}
</g>
</svg>`;

const tempDir = mkdtempSync(path.join(os.tmpdir(), "duotone-icon-"));
try {
  const svgFile = path.join(tempDir, "icon.svg");
  writeFileSync(svgFile, svg);
  const pngFile = path.resolve("images/icon.png");
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${path.join(tempDir, "profile")}`,
    `--window-size=${size},${size}`,
    "--force-device-scale-factor=2",
    `--screenshot=${pngFile}`,
    pathToFileURL(svgFile).href,
  ], { stdio: "ignore" });
  console.log(`Wrote ${path.relative(".", pngFile)}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
