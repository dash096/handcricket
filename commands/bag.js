const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
module.exports = {
    
  name: 'bag',
  description: 'Shows your backpack',
  aliases: ['inventory', 'inv'],
  category: 'handcricket',
  cooldown: '10s',
  run: async ({message, args, text, client, prefix}) => {
    
    const target = message.mentions.users.first() || message.author;
    const data = await db.findOne({_id: target.id}).catch((e) => {
        console.log(e);
    });
    
    if(!data) return message.reply(target.tag + ' isnt a player, Do "' + prefix + 'start"');
      
    let bagItems = data.bag;
    if(!bagItems) {
      bagItems = {};
    }
    
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
    
  }
};
