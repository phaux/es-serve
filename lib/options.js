const {config} = require('any-cfg')

const help = `
HTTP file server with babel compiling on the fly.
`

const cfg = config({envPrefix: 'APP_', configFile: 'server', help})
  .options({
    PORT: {
      type: 'number',
      short: 'P',
      help: 'Server port',
    },
    EXTENSIONS: {
      type: 'list',
      short: 'e',
      help: 'List of extensions interpreted as JS (default: js, jsx, mjs, ts, tsx)',
    },
    DIR_MAP: {
      type: 'map',
      short: 'd',
      help: 'Directory rewrite rules (e.g. `dist=src`)',
    },
    IGNORE: {
      type: 'list',
      short: 'i',
      help: 'Paths which will be omitted from compiling',
    },
    VERBOSE: {
      type: 'boolean',
      short: 'v',
      help: 'Verbose logging mode',
    },
    WATCH: {
      type: 'string',
      short: 'w',
      help: 'Enables watch mode and watches provided path',
    },
    HELP: {
      type: 'boolean',
      short: 'h',
      help: 'Show help',
    },
  })

const opt = cfg.parse()

if (opt.HELP) {
  cfg.help()
  process.exit(0)
}

module.exports = {
  PORT: opt.PORT || 8000,
  EXTS: ['.js', '.mjs', '.jsx', '.ts', '.tsx',
    ...(opt.EXTENSIONS || []).map(s => s.replace(/^\.?/, '.')),
  ],
  DIR_MAP: opt.DIR_MAP || {},
  IGNORE: opt.IGNORE || [],
  VERBOSE: opt.VERBOSE,
  WATCH: opt.WATCH,
  ROOT: opt._[0] || '.',
}
