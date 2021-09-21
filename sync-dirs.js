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
      //return false
      //continue
    }
    else if (fs.lstatSync(targetFolder).isDirectory() === false) {
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
    
    //console.log(logList)
    //return false
    
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
      sourceList = sourceList.map(f => f.slice(sourceFolder.length))
      /*
      fs.appendFile(sourceListFilename, sourceList.join('\n'), function (err) {
        if (err) throw err
      })
      */
      fs.writeFileSync(sourceListFilename, sourceList.join('\n'));
    }
    
    // --------------------------------
    
    
    //console.log(sourceList)
    //return false
    
    let skipFilenameList = [
      'desktop.ini'
    ]
    
    // ---------------------------------
    
    let sourceFileCount = sourceList.length
    let maxThreads = 10
    let threadCount = 0
    
    //await Promise.all(sourceList.map(async (relativePath, i) => {
    let lastTime
    let lastTimeIndex
    let lastTimeString = ''
    let lastPerSpentTime
    let handleCounter = 0
      
    for (let i = 0; i < sourceFileCount; i++) {
      
      while (threadCount >= maxThreads) {
        await sleep(100)
      }

      // -----------------------------------
      
      if (!lastTime) {
        lastTime = (new Date()).getTime()
        lastTimeIndex = i
      }
      if (handleCounter > (maxThreads) * 10) {
        let currentTime = (new Date()).getTime()
        let timeInterval = currentTime - lastTime
        
        // ---------------
        // 估算需要的時間
        
        let perSpentTime = timeInterval / handleCounter
        if (lastPerSpentTime) {
          perSpentTime = (perSpentTime + lastPerSpentTime) / 2
        }
        lastPerSpentTime = perSpentTime
        
        let needSpentTime = perSpentTime * (sourceFileCount - i)
        
        let currentDate = (new Date()).getTime()
        let predictTime = (new Date())
        predictTime.setTime(currentDate + needSpentTime)
        //console.log(predictTime.getTime())
        lastTimeString = getDateString(predictTime)
        
        // ---------------
        
        lastTime = currentTime
        lastTimeIndex = i
        handleCounter = 0
      }
      
      //console.log(handleCounter)
      
      // -----------------------------------
      
      
      let relativePath = sourceList[i]
      //console.log(relativePath)
      let sourceFile = sourceFolder + relativePath
      if (relativePath.trim() === '') {
        continue;
        //return false
      }
      
      // 取得基本路徑
      //let relativePath = sourceFile.slice(sourceFolder.length)
      //console.log(relativePath)
      let basename = path.basename(sourceFile)
      if (skipFilenameList.indexOf(basename) > -1) {
        //console.log('[IGNORE]\t' + relativePath)
        //return false
        continue
      }
      
      //console.log(sourceFile)
      
      // 我是否已經處理過這個檔案了？
      //console.log(progress)
      if (logList.indexOf(relativePath) > -1) {
        //console.log('[LOGED]\t' + relativePath)
        //return false
        continue
      }
      
      // -----------------------
      
      let percent = Math.floor(i / sourceFileCount * 100)
      let progress = '(' + percent +'%) ' + i + '/' + sourceFileCount
      if (lastTimeString !== '') {
        progress = progress + ' ' + lastTimeString
      }
      //console.log(progress)
      let ddhhmm = getDateString()
      
      // -----------------------
      
      
      let targetFile = targetFolder + relativePath
      let fileFolder = path.dirname(targetFile)
      
      let sourceFileSize = (fs.statSync(sourceFile)).size
      
      //console.log(fileFolder, sourceFileSize)
      
      // ---------------------
      
      let passed = false
      //let doWait = true
      
      let run = async () => {
        while (passed === false) {
          while (threadCount >= maxThreads) {
            await sleep(100)
          }
          
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

            let displayRelativePath = relativePath

            let displayLimit = 40
            if (displayRelativePath.length > displayLimit) {
              displayRelativePath = displayRelativePath.slice(0, displayLimit) + '...'
            }

            if (doCopy) {
              console.log('[' + ddhhmm + ' COPY ' + threadCount + ' ' + progress + ']\t' + displayRelativePath)

              threadCount++
              
              let stopped = false
              let timer = setTimeout(() => {
                // 傳送太久的話
                threadCount--
                stopped = true
                console.log('[' + ddhhmm + ' TIMEOUT ' + threadCount + ' ' + progress + ']\t' + displayRelativePath)
              }, 30 * 60 * 1000)
              
              await copyFile(sourceFile, targetFile)
              clearTimeout(timer)
              if (stopped === true) {
                continue
              }
              handleCounter++
              await sleep(10)
              threadCount--
              //console.log('[' + ddhhmm + ' COPIED   ' + progress + ']\t' + displayRelativePath)
            }
            else {
              console.log('[' + ddhhmm + ' EXISTED ' + progress + ']\t' + displayRelativePath)
              doWait = false
            }

            // -------------------------
            //fs.appendFile(logFilename, sourceFile + '\n', function (err) {
            //  if (err) throw err
            //})
            fs.appendFileSync(logFilename, relativePath + '\n')
            passed = true
          }
          catch (e) {
            console.error(e)
            await sleep(30 * 1000)
          }
        }
        
      }
      
      run()
    }
    //}))
    
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

async function copyFile(source, target) {
  let sourceFileSize = (fs.statSync(source)).size
  
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  try {
    return await new Promise(function(resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', async () => {
        
        //await sleep(100)
        
        while (true) {
          
          if (fs.existsSync(target)
                  && (fs.statSync(target)).size === sourceFileSize) {
            break
          }
          await sleep(100)
        }
        
        resolve()
      });
      rd.pipe(wr);
    });
  } catch (error) {
    rd.destroy();
    wr.end();
    throw error;
  }
}

function pad(v){
  return (v<10)?'0'+v:v
}

function getDateString(d){
  if (!d) {
    d = new Date()
  }
  //var year = d.getFullYear();
  //var month = pad(d.getMonth()+1);
  var day = pad(d.getDate());
  var hour = pad(d.getHours());
  var min = pad(d.getMinutes());
  //var sec = pad(d.getSeconds());
  //return year+month+day+hour+min+sec;
  return day +"-"+hour+":"+min
  //YYYYMMDDhhmmss
}

main()