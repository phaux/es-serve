# ES Serve

Simple web server for modern single page apps.

Usage: `es-serve [path]`

Example:

```sh
es-serve www --index-fallback --rewrite-imports
```

## Options

- `--port`, `-p`, `APP_PORT` **(number)** - Server port
- `--base-href`, `-b`, `APP_BASE_HREF` **(string)** -
  Rewrites the value of `<base href=…>` element
- `--index-fallback`, `-i`, `APP_INDEX_FALLBACK` **(boolean)** -
  Enables serving the root `index.html` for every route (instead of 404)
- `--rewrite-imports`, `-r`, `APP_REWRITE_IMPORTS` **(boolean)** -
  Rewrites import statements in JS files:
  Resolves bare module imports and adds file extension if missing.
- `--module-dir`, `-m`, `APP_MODULE_DIR` **(string)** -
  When import rewriting is enabled:
  Specifies module directory for resolving bare module names.
  (default: `node_modules`)
- `--module-map`, `-M`, `APP_MODULE_MAP` **(string)** -
  When import rewriting is enabled:
  Rewrites bare module names.
  e.g. `react=preact-compat,react-dom=preact-compat`
- `--globals`, `-g`, `APP_GLOBALS` **(string)** -
  Enables serving a config JSON file at `/globals.json`.
  The format is `var1=foo,var2=bar`
  and the result would be `{"var1": "foo", "var2": "bar"}`
- `--verbose`, `-v` **(boolean)** -
  Verbose logging mode
