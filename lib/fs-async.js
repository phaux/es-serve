const fs = require('fs')

/** @typedef {import('fs').Stats} FSStats */

/**
 * @param {string} path
 * @return {Promise<string[]>}
 */
exports.readdir = path =>
  new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err != null) reject(err)
      else resolve(files)
    })
  })

/**
 * @param {string} path
 * @return {Promise<FSStats>}
 */
exports.stat = path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err != null) reject(err)
      else resolve(stats)
    })
  })

/**
 * @param {string} path
 * @return {Promise<string>}
 */
exports.readFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err != null) reject(err)
      else resolve(data)
    })
  })
