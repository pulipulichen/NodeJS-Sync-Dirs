const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat) {
  let lockPath = archiveGetLockName(archiveFormat)
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath)
  }
  return true
}
