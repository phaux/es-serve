# ES Serve

Simple web server for modern single page apps.

Usage: `es-serve [path]`

Example:

```sh
es-serve www --index-fallback --rewrite-imports
```

## Options

- `--port`, `-p`, `APP_PORT` **(number)** - Server port
- `--base-href`, `APP_BASE_HREF` **(string)** -
  Rewrites the value of `<base href=…>` element
- `--index-fallback`, `APP_INDEX_FALLBACK` **(boolean)** -
  Enables serving the root `index.html` for every route (instead of 404)
- `--rewrite-imports`, `APP_REWRITE_IMPORTS` **(boolean)** -
  Rewrites import statements in JS files:
  Resolves bare module imports and adds file extension if missing.
- `--module-dir`, `APP_MODULE_DIR` **(string)** -
  When import rewriting is enabled:
  Specifies module directory for resolving bare module names.
  (default: `node_modules`)
- `--module-map`, `-m`, `APP_MODULE_MAP` **(map)** -
  When import rewriting is enabled:
  Rewrites bare module names.
  e.g. `es-serve -m react=preact-compat -m react-dom=preact-compat`
  or `env APP_MODULE_MAP="react=preact-compat,react-dom=preact-compat" es-serve`
- `--globals`, `-g`, `APP_GLOBALS` **(map)** -
  Enables serving a config JSON file at `/globals.json`.
  The format is `es-serve -g var1=foo -g var2=bar`
  or `env APP_GLOBALS="var1=foo,var2=bar" es-serve`
  and the result would be `{"var1": "foo", "var2": "bar"}`
- `--watch`, `-w` **(list)** -
  Enables watch mode. Listens for file changes and injects a script which reloads page.
  Multiple folders or globs can be specified.
- `--watch-ignore`, `-i` **(list)** -
  List of files or globs to ignore.
  Ignoring `node_modules` is recommended for performance.
  The `.git` folder is always ignored.
- `--verbose`, `-v` **(boolean)** -
  Verbose logging mode
