const fs = require('fs');

module.exports = (type) => {
  if(!type) type = 'type1';
  const Object = {};
  
  const files = [];
  const filesWithPNG = fs.readdirSync(`./assets/decors/${type}`).filter(file => !file.includes('character'));
  
  filesWithPNG.forEach(file => {
    files.push(file.toString().split('.').shift());
  });
  
  Object[type] = files;
  return Object[type];
};