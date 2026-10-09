# DuoTone Blue

DuoTone Blue is a pair of Visual Studio Code themes built from two hues: blue
(Uno) and gold (Duo). The package contains **DuoTone Blue Light** and
**DuoTone Blue Dark**, with the UI palette generated independently from syntax
highlighting.

## Color scheme

### Sources

- [DuoTone Light Blue Syntax](https://github.com/tsangkenneth/duotone-light-blue-syntax)
  provides the light palette.
- [DuoTone Blue Dark](https://github.com/smlombardi/duotone-blue-dark) provides
  the dark palette.
- [DuoTone Light Syntax](https://github.com/simurai/duotone-light-syntax) and
  [DuoTone Dark Syntax](https://github.com/simurai/duotone-dark-syntax) are the
  upstream two-hue syntax references.
- [Soy Themes](https://github.com/tsangkenneth/vscode-theme-soy) is the
  reference for the project structure.

### Syntax color mapping

The token scopes follow the baseline mapping in
[vscode-theme-gruvbox](https://github.com/jdinhify/vscode-theme-gruvbox), but
the colors come from DuoTone rather than Gruvbox's many unrelated accent hues.
The mapping keeps DuoTone's two-hue hierarchy:

| Scope family | Light | Dark |
| --- | --- | --- |
| Default text, comments | Uno-2 | Uno-2 |
| Strings and constants | Duo-1 | Duo-1 |
| Keywords and storage modifiers | Duo-1 | Duo-2 |
| Definitions, tags, selectors | Uno-1 | Uno-1 |
| Punctuation | Uno-3 | Uno-4 |
| Types and supported entities | Uno-1 | Uno-3 |

## Development

### Build

The generator uses Node.js directly and has no runtime or build dependencies.
Use Node.js 22.18 or newer, then run:

```sh
npm run build
```

The build generates `themes/duotone-blue-light.json` and
`themes/duotone-blue-dark.json`, and synchronizes the theme contributions in
`package.json`. `npm run check` rebuilds the files and validates their manifest,
syntax colors, and key contrast ratios. Package the extension with
`npm run package`.

### Testing in VS Code

Open this folder in VS Code and press **F5** (or choose **Run → Start
Debugging**). The `Launch Extension` configuration builds the themes first,
then opens an Extension Development Host with DuoTone Blue available. Use
**Preferences: Color Theme** in that new window to switch between the light and
dark variants. After changing a palette or the generator, press F5 again or
run **Developer: Reload Window** in the host window.

## License

[MIT](LICENSE)
