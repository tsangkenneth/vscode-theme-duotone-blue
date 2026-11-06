# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## 0.1.2 (2026-11-06)

### Fixed

- Explorer: files and folders ignored by Git, such as `node_modules`, are now
  shown in a dimmer blue. Before, they were the same colour as other files.
- Explorer: new files, whether untracked or staged, now stand out from other
  files. They are white in the dark theme and near-black in the light theme.
  Before, the light theme showed them in the same colour as other files, and
  the dark theme in a blue only slightly different from it.
- Source Control: deleted files are now red, to match removed text in the diff
  editor. Before, they were gold, which in the light theme was the same colour
  as modified files.
- Editor: the margin marker for deleted lines is now the same red. Before, it
  was a gold close to the marker for modified lines.
- Quick pick: in the dark theme, the lines between groups, such as branches,
  remote branches and tags when checking out a branch, are now visible. Before,
  they were almost the same colour as the background.
- Menus: in the dark theme, the lines between groups of menu items are now
  easier to see. Before, they were faint. This applies to menus drawn by VS
  Code, not to the native menus macOS uses by default.

## 0.1.1 (2026-10-30)

### Fixed

- Diff editor: the changed text is now highlighted more strongly than the rest
  of its line, in red for removed text and green for inserted text. Before, a
  grey highlight covered the changed text, so it stood out less than the
  unchanged text around it.

## 0.1.0 (2026-10-08)

### Added

- Two themes, DuoTone Blue Light and DuoTone Blue Dark, built from shades of
  blue (Uno) and gold (Duo). The light palette comes from DuoTone Light Blue
  Syntax, and the dark palette from DuoTone Blue Dark.
- Two-hue syntax highlighting: text, comments, definitions, types and
  punctuation are blue, and strings, constants and keywords are gold. Comments
  are italic. Semantic tokens from language servers color declarations as
  definitions and leave references as plain text.
- A workbench colored from the same palette, with gold for the cursor, badges,
  buttons and the active tab's border, filled list selections, and borderless
  tabs.
- Terminal and bracket pair colors from the same blue and gold shades.
