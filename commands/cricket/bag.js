const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const gain = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');
const getEmoji = require('../../index.js');

module.exports = {
  name: 'bag',
  aliases: ['inventory', 'inv'],
  description: 'Shows your backpack',
  category: 'Cricket',
  syntax: 'e.bag',
  cooldown: 5,
  run: async (message, args, prefix) => {
    const { content, author, channel, mentions } = message;
    
    const target = mentions.users.first() || author;
    
    const data = await db.findOne({_id: target.id});
    
    let bagItems = data.bag || {};
    
    const items = Object.keys(bagItems).map((key) => [key, bagItems[key]]);
    
    let fieldText = '';
    fieldText += `**__BackPack__**\n\n`
    for(const item of items) {
      const text = item;
      const emoji = await getEmoji(item[0]);
      fieldText += `**${emoji} ${text[0].charAt(0).toUpperCase() + text[0].slice(1)}** (${text[1]}) \n`;
    }
    
    const userDecors = data.decors || {};
    const keys = Object.keys(userDecors);
    fieldText += `\n**__Decorations__**\n\n`;
    
    if(!keys || keys.length === 0) fieldText += 'None here hehehe';
    else {
      for(const key of keys) {
        fieldText += `**${key}** - \`${userDecors[key]}\`\n`;
      }
    }
    
    const embed = await new Discord.MessageEmbed()
      .setTitle(`${target.tag}'s bag`)
      .setDescription('Pretty nice Inventory\n\n' + fieldText)
      .setFooter('Show this to your frnds!')
      .setColor('#2d61b5');
      
    message.reply(embed);
    await gain(data, 1.2, message);
  }
};
