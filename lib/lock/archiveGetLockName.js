/* global __dirname */

const fs = require('fs')
const os = require('os')
const path = require('path')

function getBaseDir () {
  //return os.tmpdir() + '/' + 
  //return path.resolve(__dirname, '../../') + '/'
  return path.resolve(__dirname, '../../')
}

module.exports = function (archiveFormat) {
  //return getBaseDir() + archiveFormat + '.lock.txt'
  return path.resolve(getBaseDir(), './lock.' + archiveFormat + '.txt')
}
