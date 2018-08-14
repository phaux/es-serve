#!/usr/bin/env node
/// <reference path="./types.d.ts" />
const http = require('http')
const fs = require('fs')
const {join, relative, dirname, resolve} = require('path').posix
const {load} = require('any-cfg')
const stringReplaceAsync = require('string-replace-async')
const {URL} = require('url')
const {parse: parseUrl} = require('url')
const mime = require('mime')

const {
  results: {
    PORT = 8000,
    BASE_HREF,
    INDEX_FALLBACK,
    REWRITE_IMPORTS,
    MODULE_MAP = '',
    MODULE_DIR = 'node_modules',
    GLOBALS,
    VERBOSE,
    WATCH,
    WATCH_IGNORE = 'node_modules;.*',
  },
  rest: [CWD = '.'],
} = load({
  envPrefix: 'APP_',
  options: {
    PORT: {type: 'number', short: 'p'},
    BASE_HREF: {type: 'string', short: 'b'},
    INDEX_FALLBACK: {type: 'boolean', short: 'i'},
    REWRITE_IMPORTS: {type: 'boolean', short: 'r'},
    MODULE_MAP: {type: 'string', short: 'M'},
    MODULE_DIR: {type: 'string', short: 'm'},
    GLOBALS: {type: 'string', short: 'g'},
    VERBOSE: {type: 'boolean', short: 'v'},
    WATCH: {type: 'string', short: 'w'},
    WATCH_IGNORE: {type: 'string', short: 'W'},
  },
})

/**
 * @param {string} s
 * @return {string}
 */
const escRegex = s => s.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')

const modMap = new Map(
  `${MODULE_MAP}`
    .split(/[,;]/)
    .map(param => /** @type {[string, string]} */ (param.split('=', 2)))
)

const ROOT = resolve(CWD)
console.log(`Root path is: ${ROOT}`)

/** @type {{[param: string]: string}} */
const globals = `${GLOBALS || ''}`
  .split(/[,;]/)
  .map(param => param.split('=', 2))
  .filter(([k]) => !!k)
  .reduce((o, [k, v]) => Object.assign(o, {[k]: v}), {})

/**
 * @param {string} path
 * @return {Promise<'f' | 'd' | null>}
 */
const stat = path => new Promise(cb =>
  fs.stat(path, (err, stats) => {
    if (!err) cb(stats.isDirectory() ? 'd' : 'f')
    else cb(null)
  })
)

/**
 * @param {string} path
 * @return {Promise<string>}
 */
const read = path => new Promise((resolve, reject) =>
  fs.readFile(path, 'utf8', (err, str) => err ? reject(err) : resolve(str))
)

const impRgx =
  /\bimport\b\s*(?:([*{,}$\w\s]+?)\s*\bfrom\b)?\s*(['"`])([/@.-\w]+)\2/g

// TODO create cache for converted files
/**
 * @param {string} reqPath
 * @return {Promise<string>}
 */
const convertJs = async reqPath => {

  const reqPathFull = join(ROOT, reqPath)
  let src = await read(reqPathFull)

  if (REWRITE_IMPORTS) {
    src = await stringReplaceAsync(src, impRgx, async (ln, vars, q, impPath) => {

      // valid imports are URLs or relative paths
      const valid = (() => {
        try { new URL(impPath) }
        catch (err) { return false }
        return true
      })()
      || impPath.match(/^(\/|\.\/|\.\.\/)/)

      // rewrite bare modules
      if (!valid) {
        // apply module mapping
        for (const [from, to] of modMap) {
          const regex = new RegExp(`^${escRegex(from)}(/|$)`)
          const match = regex.exec(impPath)
          if (!match) continue
          impPath = to + impPath.substr(from.length)
        }
        // convert bare module import to full relative path
        impPath = relative(dirname(reqPath), join('/', MODULE_DIR, impPath))
      }

      // analyze relative imports
      if (impPath.match(/^(\.\/|\.\.\/)/)) {

        let impPathFull = join(dirname(reqPathFull), impPath)

        // find main script if importing a directory with package.json
        if (
          await stat(impPathFull) == 'd'
          && await stat(join(impPathFull, 'package.json')) == 'f'
        ) {
          const pkg = await read(join(impPathFull, 'package.json'))
            .then(JSON.parse).catch(() => ({}))
          const modPath = pkg.module || pkg.main || ''
          impPath = join(impPath, modPath)
          impPathFull = join(impPathFull, modPath)
        }

        // add `index` if importing a directory
        if (await stat(impPathFull) == 'd') {
          impPath = join(impPath, 'index')
          impPathFull = join(impPathFull, 'index')
        }

        // add extension if missing
        const exists = !!await stat(impPathFull)
        if (!exists && await stat(`${impPathFull}.js`) == 'f') impPath += '.js'
        else if (!exists && await stat(`${impPathFull}.mjs`) == 'f') impPath += '.mjs'

      }

      return `import ${vars ? vars + ' from ' : ''}${q}${impPath}${q}`

    })
  }
  return src
}

/**
 * @param {string} reqPath
 * @return {Promise<string>}
 */
const convertHtml = async reqPath => {
  let src = await read(join(ROOT, reqPath))
  if (BASE_HREF != null) src = src.replace(
    /<base\s+href=["'/._a-z0-9-]+\s*>/i,
    `<base href="${BASE_HREF}">`
  )
  return src
}

const rootIndexStat = stat(join(ROOT, 'index.html'))

const watch = WATCH == null ? null : require('chokidar').watch(WATCH, {
  persistent: true,
  cwd: ROOT,
  ignored: WATCH_IGNORE.split(';'),
  ignoreInitial: true,
})

const server = http.createServer(async (req, res) => {

  try {

    // only handle GET requests
    if (req.method != 'GET') {
      res.statusCode = 405
      return res.end()
    }

    const path = parseUrl(`${req.url}`).pathname || '/'
    const type = await stat(join(ROOT, path))

    // serve global config from command arg
    if (path == '/globals.json' && GLOBALS != null) {
      res.setHeader('content-type', 'application/json')
      if (VERBOSE) console.log('200', path, '(globals)')
      return res.end(JSON.stringify(globals, undefined, 2))
    }


    if (path == '/_dev_watch_events') {
      res.setHeader('content-type', 'text/event-stream')
      /**
       * @param {string} ev
       * @param {string} file
       * @return {void}
       */
      const listener = (ev, file) => {
        if (!['add', 'change'].includes(ev)) return
        console.log(ev, file)
        res.write(`data: ${file}\n\n`)
      }
      watch.addListener('all', listener)
      req.on('close', () => watch.removeListener('all', listener))
      return
    }

    // process regular files
    if (type == 'f') {

      if (path.match(/\.m?js$/)) {
        res.setHeader('content-type', 'text/javascript')
        const data = await convertJs(path)
        if (VERBOSE) console.log('200', path, '(js)')
        return res.end(data)
      }

      if (VERBOSE) console.log('200', path)
      const mimetype = mime.getType(path)
      if (mimetype != null) res.setHeader('content-type', mimetype)
      return fs.createReadStream(join(ROOT, path)).pipe(res)

    }

    // TODO include refresh script
    // app index fallback
    if (
      // only when enabled
      INDEX_FALLBACK
      // if not in modules dir
      && (!MODULE_DIR || !path.startsWith(join('/', MODULE_DIR)))
      // only for simple paths and no file extension
      && path.match(/[/\w-]+$/)
      // only if there's an index.html in root
      && await rootIndexStat
    ) {
      res.setHeader('content-type', 'text/html')
      const data = await convertHtml('index.html')
      if (VERBOSE) console.log('200', path, '(index)')
      return res.end(data)
    }

    if (type == 'd') {
      console.log('403', path, '(dir)')
      res.statusCode = 403
      return res.end()
    }

    console.log('404', path)
    res.statusCode = 404
    return res.end()

  }
  catch (err) {
    console.error('500', err)
    res.statusCode = 500
    res.end(err.message)
  }

})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
