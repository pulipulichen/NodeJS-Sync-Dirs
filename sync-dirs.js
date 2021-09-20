/* global process, __dirname, Promise */

//const config = require('./config.js')
const handleFileFromArgvArray = require('./lib/cli/handleFileFromArgvArray.js')
const execShellCommand = require('./lib/cli/execShellCommand.js')

const path = require('path')
const fs = require('fs')

const getFilelistFromFolder = require('./lib/fileList/getFilelistFromFolder.js')
const sleep = require('./lib/await/sleep.js')

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
    
    // 先取得快取
    let logList = []
    
    let logFilename = path.resolve(__dirname, './log/', getLogFilename(sourceFolder) + '-log.txt')
    //console.log(logFilename)
    
    
    if (fs.existsSync(logFilename)) {
      const buffer = fs.readFileSync(logFilename, 'utf8')
      let fileContent = buffer.toString();
      fileContent = fileContent.replace(/^\uFEFF/, '');
      
      logList = fileContent.split('\n').filter(f => f.trim() !== '')
    }
    
    // ---------------------------------
    let sourceList = []
    
    let sourceListFilename = path.resolve(__dirname, './log/', getLogFilename(sourceFolder) + '-list.txt')
    
    if (fs.existsSync(sourceListFilename)) {
      const buffer = fs.readFileSync(sourceListFilename, 'utf8')
      let fileContent = buffer.toString();
      fileContent = fileContent.replace(/^\uFEFF/, '');
      
      sourceList = fileContent.split('\n').filter(f => f.trim() !== '')
    }
    
    if (sourceList.length === 0) {
      sourceList = await getFilelistFromFolder(sourceFolder)
      /*
      fs.appendFile(sourceListFilename, sourceList.join('\n'), function (err) {
        if (err) throw err
      })
      */
      fs.writeFileSync(sourceListFilename, sourceList.join('\n'));
    }
    
    // --------------------------------
    
    
    //console.log(sourceList)
    
    let skipFilenameList = [
      'desktop.ini'
    ]
    
    // ---------------------------------
    
    let sourceFileCount = sourceList.length
    await Promise.all(sourceList.map(async (sourceFile, i) => {
      
      if (sourceFile.trim() === '') {
        return false
      }
      
      // 取得基本路徑
      let relativePath = sourceFile.slice(sourceFolder.length)
      //console.log(relativePath)
      let basename = path.basename(sourceFile)
      if (skipFilenameList.indexOf(basename) > -1) {
        //console.log('[IGNORE]\t' + relativePath)
        return false
      }
      
      //console.log(sourceFile)
      
      // 我是否已經處理過這個檔案了？
      if (logList.indexOf(sourceFile) > -1) {
        //console.log('[LOGED]\t' + relativePath)
        return false
      }
      
      // -----------------------
      
      let percent = Math.floor(i / sourceFileCount * 100)
      let progress = '(' + percent +'%) ' + i + '/' + sourceFileCount
      
      // -----------------------
      
      
      let targetFile = targetFolder + relativePath
      let fileFolder = path.dirname(targetFile)
      
      let sourceFileSize = (fs.statSync(sourceFile)).size
      
      //console.log(fileFolder, sourceFileSize)
      
      // ---------------------
      
      let passed = false
      let doWait = true
      
      while (passed === false) {
        try {
          
          // -------------------------
          // 建立目錄
          
          if (fs.existsSync(fileFolder) === false
                  || fs.lstatSync(fileFolder).isDirectory() === false) {
            fs.mkdirSync(fileFolder, { recursive: true });
          }
          
          // -------------------------
          // 比大小
          let doCopy = true
          if (fs.existsSync(targetFile)) {
            let targetFileSize = (fs.statSync(targetFile)).size
            if (targetFileSize === sourceFileSize) {
              doCopy = false
            }
          }
          
          // -------------------------
          // 複製
          
          if (doCopy) {
            await copyFile(sourceFile, targetFile)
            console.log('[COPIED ' + progress + ']\t' + relativePath)
          }
          else {
            console.log('[EXISTED ' + progress + ']\t' + relativePath)
            doWait = false
          }

          // -------------------------
          //fs.appendFile(logFilename, sourceFile + '\n', function (err) {
          //  if (err) throw err
          //})
          fs.appendFileSync(logFilename, sourceFile + '\n')
          passed = true
        }
        catch (e) {
          console.error(e)
          await sleep(30 * 1000)
        }
      }
      
      if (doWait) {
        await sleep(100)
      }
    }))
    
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

let getLogFilename = function (dir) {
  let basename = path.basename(dir)
  let time = fs.lstatSync(dir).mtime
  
  return basename + '-' + time.getTime()
}

const copyFile = async (src, dest) => {
  await fs.promises.copyFile(src, dest)
}

main()