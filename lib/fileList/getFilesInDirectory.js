const { readdirSync } = require('fs')

module.exports = function (source) {
  return readdirSync(source, { withFileTypes: true })
    //.filter(dirent => dirent.isDirectory())
    .map(dirent => source + '/' + dirent.name)
}