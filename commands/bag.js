const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');

module.exports = {
    
  name: 'bag',
  description: 'Shows your backpack',
  aliases: ['inventory', 'inv'],
  category: 'handcricket',
  run: async ({message}) => {
    
    const data = await db.findOne({_id: message.author.id}).catch((e) => {
        console.log(e);
    });
    
    if(!data) return message.reply('You arent a player, Do "!start"');
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`${message.author.tag}'s bag`)
      .setDescription('Pretty Large Backpack')
      .setFooter('Show this to your frnds!')
      .setColor('#2d61b5')
      
    const bagItems = data.bag;
    const items = Object.keys(bagItems).map((key) => [key, bagItems[key]]);
    
    for(const item of items) {
      const text = item.join(' ');
      embed.addField(text.toUpperCase[0], text[1], true);
    }
    
    await message.reply(embed);
    
  }
}