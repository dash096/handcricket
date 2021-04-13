const Discord = require('discord.js');

module.exports = {
  name: 'vote',
  aliases: ['v', 'daily', 'claim'],
  description: 'Vote the bot! Support when',
  category: 'general',
  syntax: 'e.vote',
  run: async ({message, topggapi}) => {
    const { content, author, channel, mentions } = message;
    
    const voted = await topggapi.hasVoted(author.id);
    
    if(voted === true) {
      const embed = new Discord.MessageEmbed()
        .setTitle('Vote Command')
        .setDescription('Thanks for Supporting me! You have already voted for me.')
        .setColor('BLUE')
        .setThumbnail(author.displayAvatarURL());
      channel.send(embed);
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle('Vote Command')
        .setDescription('You havent voted yet, Support us [here](https://top.gg/bot/804346878027235398/vote)' + 
        '\n**Note:** It might take a maximum of 3 minutes for you to get the vote reward.')
        .setColor('BLUE')
        .setThumbnail(author.displayAvatarURL());
      channel.send(embed);
    }
  }
};