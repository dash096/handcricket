const Discord = require('discord.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'invite',
  aliases: ['support', 'server', 'join', 'bot', 'add'],
  description: 'Invite the Bot or Join the Official server',
  category: 'General',
  syntax: 'e.invite',
  cooldown: 2,
  run: ({message, prefix}) => {
    let { content, author, channel, mentions } = message;
    
    let command = content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
    
    let serverAlias = ['support', 'community', 'server', 'join']
    
    if (serverAlias.includes(command)) {
      message.reply('discord.gg/3dhtFggFXZ');
    } else {
      message.reply('https://discord.com/api/oauth2/authorize?client_id=804346878027235398&permissions=321600&scope=bot');
    }
  }
};