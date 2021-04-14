const fs = require('fs');

module.exports = function pushType(type) {
  const Object = {};
  
  const files = []
  const filesWithPNG = fs.readdirSync(`./decors/${type}`);
  
  filesWithPNG.forEach(file => {
    files.push(file.toString().split('.').shift());
  });
  
  Object[type] = files;
  return Object[type];
}