# ES Serve

Simple web server for modern single page apps.

Usage: `es-serve [path]`

**Options:**

*   `--port/-p number`, `APP_PORT=number` -
    Server port

*   `--base-href string`, `APP_BASE_HREF=string` -
    Rewrite the value of `<base href=…>` element

*   `--(no-)index-fallback`, `APP_INDEX_FALLBACK=boolean` -
    Serve index.html for unknown routes instead of 404

*   `--(no-)rewrite-imports`, `APP_REWRITE_IMPORTS=boolean` -
    Make bare module imports in JS just work™

*   `--module-map/-m key=string ...`, `APP_MODULE_MAP=key=string,...` -
    Rewrite module names

*   `--module-dir string`, `APP_MODULE_DIR=string` -
    Module directory. Default: `node_modules`

*   `--globals/-g key=string ...`, `APP_GLOBALS=key=string,...` -
    Serve some variables as `/globals.json`

*   `--(no-)verbose/-v`, `APP_VERBOSE=boolean` -
    Verbose logging mode

*   `--watch/-w string`, `APP_WATCH=string` -
    Enables watch mode and watches provided path

*   `--watch-ignore/-i string ...`, `APP_WATCH_IGNORE=string,...` -
    Files to ignore when watching

*   `--(no-)help/-h`, `APP_HELP=boolean` -
    Show help

Options can be provided via `server.json` or `server.toml` config file.
Key names should be in lower_snake_case.
