const Discord = require('discord.js');
const db = require('../schemas/player.js');
const itemDb = require('../schemas/items.js');

const getEmoji = require('../index.js');

module.exports = {
  name: "shop",
  aliases: ["market"],
  category: "handcricket",
  cooldown: '10s',
  description: 'Displays the items that are for sell in the shop',
  run: async ({
    message
  }) => {
    const emoji = await getEmoji;

    const data = await db.findOne( {
      _id: message.author.id
    }).catch((e) => {
      console.log(e);
    });
    
    if (!data) {
      message.reply(message.author.tag + "You are not a player. Do `" + prefix + "start`");
      return;
    }
    
    const docs = await itemDb.find({}).sort({_id: 1});
    let text = '';
    
    docs.forEach(doc => {
      const title = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
      text += `**${title} - ${emoji} ${doc._id}**\n\n`;
      text += `${doc.description}\n\n`;
    });
    
    const embed = new Discord.MessageEmbed()
    .setTitle(`Shop Items`)
    .setDescription(`You can buy an item by typing "!buy <name> <amount>", you have a total of ${emoji} ${data.cc}\n\n` + text)
    .setFooter(`Requested by ${message.author.tag}`)
    .setColor('#2d61b5');

    await message.reply(embed);
  }
};