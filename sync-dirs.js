/* global process */

//const config = require('./config.js')
const handleFileFromArgvArray = require('./lib/cli/handleFileFromArgvArray.js')
const execShellCommand = require('./lib/cli/execShellCommand.js')

const path = require('path')
const fs = require('fs')

const getFilelistFromFolder = require('./lib/fileList/getFilelistFromFolder.js')

let main = function () {

  handleFileFromArgvArray({
    lockKey: false
  },async (argvArray) => {
    
    //console.log(argvArray)
    
    let sourceFolder = argvArray[0]
    let targetFolder = argvArray[1]
    
    // --------------------------------
    
    if (sourceFolder.endsWith('/') || sourceFolder.endsWith('\\')) {
      sourceFolder = sourceFolder.slice(0, -1)
    }
    
    if (targetFolder.endsWith('/') || targetFolder.endsWith('\\')) {
      targetFolder = targetFolder.slice(0, -1)
    }
    
    // --------------------------------
    
    if (fs.existsSync(sourceFolder) === false) {
        //return continue
        return false
        //continue
      }
      
      if (fs.lstatSync(sourceFolder).isDirectory() === false) {
        throw Error(sourceFolder + ' should be a directory.')
      }
    
    // --------------------------------
    
    if (fs.existsSync(targetFolder) === false) {
      //return continue
      return false
      //continue
    }

    if (fs.lstatSync(targetFolder).isDirectory() === false) {
      throw Error(targetFolder + ' should be a directory.')
    }
    
    // --------------------------------
    
    let sourceList = await getFilelistFromFolder(sourceFolder)
    //console.log(sourceList)
    
    // ---------------------------------
    
    sourceList.forEach((sourceFile) => {
      //console.log(sourceFile)
      
      // 我是否已經處理過這個檔案了？
      
      
      // -----------------------
      
      // 取得基本路徑
      let relativePath = sourceFile.slice(sourceFolder.length)
      //console.log(relativePath)
      
      let targetFile = targetFolder + relativePath
      let fileFolder = path.dirname(targetFile)
      
      console.log(fileFolder)
      
      // ---------------------
    })
    
    /*
    if (!file) {
      execShellCommand(`wine "${appPath}"`)
      return
    }

    file = path.resolve(file)
    // console.log(file)
  
    let dirname = path.dirname(file)
    let filename = path.basename(file)
    //console.log(dirname)
    
    process.chdir(dirname)
  
    let command = `wine "${appPath}" "${filename}"`
    //console.log(command)
  
    execShellCommand(command)
     */
  }) 
}

main()