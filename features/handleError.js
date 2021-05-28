const fs = require('fs');

module.exports = () => {
  process.on('unhandledRejection', (err) => {
    fs.appendFile('./temp/errors.txt', `rejected: ${err.name}\n    ${err.message}\n\n\n`, function (err) {
      console.error('unhandledRejection:', err.name);
    });
  });
  process.on('uncaughtException', (err) => {
    fs.appendFile('./temp/errors.txt', `excepted: ${err.name}\n    ${err.message}\n\n\n`, function (err) {
      console.error('uncaughtException:', err.name);
    });
  });
}