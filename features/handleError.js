const fs = require('fs');

module.exports = () => {
  process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection:', err);
  });
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
  });
}