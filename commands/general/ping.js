const { MessageButton } = require('discord-buttons');

module.exports = {
    name: 'ping',
    description: 'Pong!',
    category: 'General',
    syntax: 'e.ping',
    cooldown: 2,
    run: async ({message}) => {
      const { content, author, channel, mentions } = message;
      
      const repingButton = new MessageButton()
        .setStyle('green')
        .setLabel('Repong')
        .setID('Reping');
      
      message.reply('Ponging..').then(msg => {
        msg.edit(`Pong! ${msg.createdTimestamp - message.createdTimestamp}ms`/*, {
          button: repingButton
        }*/);
      }).catch(e => {
        console.log(e)
      });
    }
};