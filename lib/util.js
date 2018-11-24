const {join} = require('path')
const {DIR_MAP} = require('./options')

/**
 * @param {string} path
 * @return {string} path
 */
module.exports.rewriteDir = path => {
  path = join('/', path)
  return Object.entries(DIR_MAP).reduce((path, [from, to]) => {
    from = join('/', from, '/')
    if (path.substr(0, from.length) == from)
      return join(to, path.substr(from.length))
    else return path
  }, path)
}
