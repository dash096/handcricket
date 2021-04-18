const Discord = require('discord.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'invite',
  aliazds: ['link', 'support', 'server', 'join', 'bot'],
  description: 'Invite the Bot or Join the Official server',
  category: 'General',
  syntax: 'e.invite',
  cooldown: 2,
  run: ({message}) => {
    const { content, author, channel, mentions } = message;
    const embed = new Discord.MessageEmbed()
      .setTitle('Links')
      .setDescription('Here are the links that you\'d ever need\n\n' +
      ' Official Guild - https://bit.ly/dispoGuild\n\n Invite Bot - https://bit.ly/dispoBot\n\n If you are looking for commands/docs, use the command `e.help` to know about it.')
      .setFooter('Have a Good Day :)')
      .setColor(embedColor);
    channel.send(embed);
  }
};