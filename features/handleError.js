


module.exports = () => {
  process.on('unhandledRejection', (err) => {
    if(err.name === 'DiscordAPIError') {
      console.error('DiscordApiError', err.message);
    } else {
      console.error('unhandledRejection:', err);
    }
  });
  process.on('uncaughtException', (err) => {
    if(err.name === 'DiscordAPIError') {
      console.error('DiscordApiError', err.message);
    } else {
      console.error('uncaughtException:', err);
    }
  });
}