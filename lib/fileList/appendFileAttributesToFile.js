const fs = require('fs');

module.exports = function (attrs, targetFile) {

  return new Promise(resolve => {
    let keys = Object.keys(attrs)
    let attrsString = keys.map(a => attrs[a]).join(',')

    let doAppend = function () {
      fs.appendFile(targetFile, attrsString, function (err) {
        if (err) throw err;

        //console.log('Saved!');
        resolve()
      });
    }

    if (fs.existsSync(targetFile)) {
      fs.appendFile(targetFile, '\n', function (err) {
        if (err) throw err;
        doAppend()
      });
    }
    else {
      fs.appendFile(targetFile, keys.join(',') + '\n', function (err) {
        if (err) throw err;
        doAppend()
      });
    }
  })
    
}