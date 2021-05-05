module.exports = () => {
  process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection:', err);
  });
}