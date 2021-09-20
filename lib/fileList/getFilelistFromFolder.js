/* global Promise */

const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

/*
let run = async function () {
  let result = await getFiles("D:/xampp/htdocs/projects-autoit/AutoIt-Archive-Util/[Document/20210329-zip")
  console.log(result)
  //console.log('aaa')
}

run()
*/

module.exports = getFiles