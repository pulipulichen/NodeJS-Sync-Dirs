/* global process */

module.exports = function () {
  let output = []
  process.argv.forEach(function (val, index, array) {
    if (index < 2) {
      return false
    }
    //console.log(index + ': ' + val);
    if (val.startsWith("'")) {
      val = val.slice(1)
    }
    if (val.endsWith("'")) {
      val = val.slice(0, -1)
    }
    
    if (val.indexOf(';') === -1) {
      output.push(val)
    }
    else {
      val.split(';').forEach(v => {
        output.push(v)
      }) 
    }
  })
  
  //console.log(output)
  
  return output
}