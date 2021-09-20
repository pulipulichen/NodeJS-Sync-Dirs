/* global Promise */

const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function isEmptyFolder(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  return (dirents.length === 0)
}

/*
let run = async function () {
  let result = await getFiles("D:/xampp/htdocs/projects-autoit/AutoIt-Archive-Util/[Document/20210329-zip")
  console.log(result)
  //console.log('aaa')
}

run()
*/

module.exports = isEmptyFolder