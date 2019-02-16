/** @type {Map<string, import('fs').FSWatcher>} */
const watchers = new Map()

const {watch} = require('fs')
const {join} = require('path')
const {stat, readdir} = require('./fs-async')

/**
 * @param {string} path
 * @param {function(string): void} cb
 * @return {Promise<void>}
 */
async function rwatch(path, cb) {
  const stats = await stat(path).catch(() => undefined)
  if (stats == null || !stats.isDirectory()) return
  const files = await readdir(path)
  await Promise.all(files.map(file => rwatch(join(path, file), cb)))
  const watcher = watch(path, async (ev, file) => {
    const subpath = join(path, file)
    if (ev == 'change') cb(subpath)
    else if (ev == 'rename') {
      const stats = await stat(subpath).catch(() => undefined)
      if (stats) {
        if (stats.isFile()) cb(subpath)
        if (stats.isDirectory()) rwatch(subpath, cb)
      }
      else {
        const watcher = watchers.get(subpath)
        if (watcher != null) {
          watcher.close()
          watchers.delete(subpath)
        }
      }
    }
  })
  watchers.set(path, watcher)
}

const {EventEmitter} = require('events')
const {WATCH} = require('./options')

module.exports =
  WATCH == null
    ? undefined
    : (() => {
      const watcher = new EventEmitter()
      for (const dir of WATCH) rwatch(dir, file => watcher.emit('change', file))
      return watcher
    })()
