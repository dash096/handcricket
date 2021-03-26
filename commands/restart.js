module.exports = {
  name: 'restarted',
  category: 'general',
  hidden: true,
  description: 'Owner Only',
  run: async ({message}) => {
    if(message.author.id === '772368021821718549') {
      message.reply('Be right Back.');
      await process.exit();
    }
    else {
      message.reply('Seriously You think you can do this?');
    }
  }
}