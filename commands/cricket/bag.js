const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const gain = require('../../functions/gainExp.js');

module.exports = {
  name: 'bag',
  aliases: ['inventory', 'inv'],
  description: 'Shows your backpack',
  category: 'Cricket',
  syntax: 'e.bag',
  cooldown: 10,
  run: async (message, args, prefix) => {
    const target = message.mentions.users.first() || message.author;
    const data = await db.findOne({_id: target.id});
    if(!data) return message.reply(target.tag + ' isnt a player, Do "' + prefix + 'start"');
    
    let bagItems = data.bag || {};
    
    const items = Object.keys(bagItems).map((key) => [key, bagItems[key]]);
    
    let fieldText = '';
    for(const item of items) {
      const text = item;
      fieldText += `**${text[0].charAt(0).toUpperCase() + text[0].slice(1)}** (${text[1]}) \n`;
    }
    
    const embed = await new Discord.MessageEmbed()
      .setTitle(`${target.tag}'s bag`)
      .setDescription('Pretty nice Inventory\n' + fieldText)
      .setFooter('Show this to your frnds!')
      .setColor('#2d61b5');
      
    message.reply(embed);
    await gain(data, 0.5);
  }
};
