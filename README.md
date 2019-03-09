# PWA Serve

[![npm](https://img.shields.io/npm/v/pwa-serve.svg)](https://www.npmjs.com/package/pwa-serve)

Simple web server with babel compilation on the fly. In many cases it can be used as a replacement for webpack-dev-server or similar.

**Example usage**

```sh
pwa-serve --dir-map "dist=src" --watch "src" --watch "styles"
```

## Features

- History API fallback (serve `index.html` for unknown routes).
- URL rewriting, useful for mapping your `dist` folder to `src`.
- Compiling scripts on the fly with babel (with cache). Simply add babel config to your project.
- Resolving bare imports via `babel-plugin-bare-import-rewrite` by default.
- Watch mode and auto-refresh (like browser-sync).

## Options

- `--port` **number** -
  Server port (default: 8000)

- `--extensions` / `-e` **string** ... -
  Specify additional extensions interpreted as JS (default: js, jsx, mjs, ts, tsx)

- `--dir-map` / `-d` **key=value** ... -
  Directory rewrite rules (e.g. `dist=src`)

- `--ignore` / `-i` **string** ... -
  Paths which will be omitted from compiling

- `--verbose` / `-v` -
  Verbose logging mode

- `--watch` / `-w` **string** ... -
  Enables watch mode and watches provided paths

Options can be also provided via `server.config.json` (or `.toml`) file (format `opt_name`) or via environment variables (format `APP_OPT_NAME`)

## Non-goals

### Asset bundling

Browsers can't `import` styles nor images. If you want component-relative assets use `import.meta.url` and configure your bundler appropriately. If you need scoped CSS, use react's styled components or lit-html `` html`<style></style>` ``.

### Hot module replacement

Too complicated

## Changelog

### `0.2.0`

- Initial version

### `0.2.1`

- Fix 404 on windows
- Search babel config relative to provided root path
- Send status text on error
- Strip ANSI color codes from errors
