const fs = require('fs');

module.exports = function pushType(type) {
  const Object = {};
  
  const files = []
  const filesWithPNG = fs.readdirSync(`./decors/${type}`).filter(file => !file.includes('character'));
  
  filesWithPNG.forEach(file => {
    files.push(file.toString().split('.').shift());
  });
  
  Object[type] = files;
  return Object[type];
}