const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const embedColor = require('../../functions/getEmbedColor.js');

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
      const cooldown = await getCooldown(author);
      const embed = new Discord.MessageEmbed()
        .setTitle('Vote Command')
        .setDescription('Thanks for Supporting me! You have already voted for me.\n' + cooldown +
        '\n [Community Server](https://bit.ly/dispoGuild) - Join for additional fun and community only features.' +
        '\n [Invite Bot to Your World](https://bit.ly/dispoBot) - Having fun in your palace is more fun')
        .addField(`Vote Streak: ${data.voteStreak || 0}`, 'You will get a decor for each 10s after 30')
        .setColor(embedColor)
        .setThumbnail(author.displayAvatarURL());
      message.reply(embed);
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle('Vote Command')
        .setDescription('You havent voted yet, Support us [here](https://top.gg/bot/804346878027235398/vote)' + 
        '\n**PS:** It might take a maximum of 3 minutes for you to get the vote reward.' +
        '\n [Community Server](https://bit.ly/dispoGuild) - Join for additional fun and community only features.' +
        '\n [Invite Bot to Your World](https://bit.ly/dispoBot) - Having fun in your palace is more fun')
        .addField(`Vote Streak: ${data.voteStreak || 0}`, 'You will get a decor for each 10s after 30')
        .setColor(embedColor)
        .setThumbnail(author.displayAvatarURL());
      message.reply(embed);
    }
  }
};

async function getCooldown(user) {
  try {
    const data = await db.findOne({_id: user.id});
    const time = data.voteCooldown;
    const ms = time.getTime() - Date.now();
    const sec = ms/1000;
    const min = sec/60;
    const hour = (min/60).toString().split('.').shift();
    const remainingMin = (min % 60).toFixed(0) || 0;
    return `You can vote again in ${hour}hour(s) and ${remainingMin}min(s)`;
  } catch (e) {
    console.log(e);
    return '';
  }
}