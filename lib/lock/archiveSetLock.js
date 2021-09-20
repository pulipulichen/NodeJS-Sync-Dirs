const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat, command) {
  return new Promise((resolve) => {
    fs.writeFileSync(archiveGetLockName(archiveFormat), command)
    resolve()
  })
}
