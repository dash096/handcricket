module.exports = {
  name: 'restart',
  category: 'general',
  hidden: true,
  description: 'Owner Only',
  run: async ({message}) => {
    if(message.author.id === '772368021821718549') {
      message.channel.send('Be right Back.');
      setTimeout( () => {
        process.exit();
      }, 3000);
    }
    else {
      message.reply('Seriously You think you can do this?');
    }
  }
}