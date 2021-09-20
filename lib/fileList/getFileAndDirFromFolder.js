/* global Promise */

const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = resolve(dir, dirent.name)
    
    if (dirent.isDirectory() === false) {
      return res
    }
    else {
      return [res].concat(await getFiles(res))
    }
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