module.exports = {
  name: 'shutdown',
  category: 'general',
  hidden: true,
  description: 'Owner Only',
  run: ({message}) => {
    if(message.author.id === '772368021821718549') {
      process.exit();
    }
    else {
      message.reply('Seriously You think you can do this?');
    }
  }
}