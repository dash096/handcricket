module.exports = {
  name: 'vote',
  aliases: ['v'],
  description: 'Vote the bot! Support when',
  category: 'general',
  syntax: 'e.vote',
  run: (message) => {
    const { content, author, channel, mentions } = message;
    message.reply('The bot has been sent for approval to lazy devs of top.gg who are still doing nothing!');
  }
};