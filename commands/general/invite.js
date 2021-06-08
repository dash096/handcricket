const Discord = require('discord.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'invite',
  aliases: ['link', 'support', 'server', 'join', 'bot', 'add'],
  description: 'Invite the Bot or Join the Official server',
  category: 'General',
  syntax: 'e.invite',
  cooldown: 2,
  run: ({message}) => {
    const { content, author, channel, mentions } = message;
    message.reply('https://discord.com/api/oauth2/authorize?client_id=804346878027235398&permissions=321600&scope=bot');
  }
};