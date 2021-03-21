const db = require("../schemas/player.js");
const Discord = require("discord.js");

module.exports = {
  name: 'profile',
  aliases: ['pf', 'info'],
  category: 'handcricket',
  description: 'Shows the profile of a user.',
  run: async ({message}) => {
    
    const data = await db.findOne({ _id: message.author.id });

    if (!data) {
      message.reply("Do !start before you can play.");
      return;
    }

    const embed = new Discord.MessageEmbed()
      .setTitle(message.author.username)
      .addField("balance", data.cc)
      .addField("wins", data.wins)
      .addField("Toss Multi", data.tossMulti)
      .addField("Coins Multi", data.goldMulti)
      .setFooter(data.startedOn)
      .setColor("BLACK");

    message.reply(embed);
  }
}