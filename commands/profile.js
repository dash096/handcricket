const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const gain = require('../functions/gainExp.js');

module.exports = {
  name: 'profile',
  aliases: ['pf', 'info'],
  category: 'handcricket',
  cooldown: '10s',
  description: 'Shows the profile of a user.',
  run: async ({message, args, text, client, prefix}) => {
    const emoji = await getEmoji;
    
    const target = message.mentions.users.first() || message.author;

    const data = await db.findOne({
      _id: target.id
    }).catch((e) => {
      console.log(e);
    });
    
    if (!data) {
      message.reply(message.author.tag + " is not a player. Do `" + prefix + "start`");
      return;
    }
    
    let cb = '';
    if(data.coinBoost) {
      cb = ' ⏳';
    }
    let tb = '';
    if(data.tossBoost) {
      tb = ' ⏳';
    }
    const embed = new Discord.MessageEmbed()
    .setTitle(`Profile of **${target.tag}**`)
    .addField("Exp", data.xp)
    .addField("Balance", ` ${emoji} ${data.cc}`, true)
    .addField("Wins", data.wins, true)
    .addField("Toss Multi", data.tossMulti + tb, true)
    .addField("Coins Multi", data.coinMulti + cb, true)
    .setFooter(data.startedOn)
    .setColor('#2d61b5');

    message.reply(embed);
    await gain(data, 1);
  }
};