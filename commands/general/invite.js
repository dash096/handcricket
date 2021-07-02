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
      message.reply(process.env.COMMUNITY_URL)
    } else {
      message.reply(process.env.INVITE_URL)
    }
  }
};