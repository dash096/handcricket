const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const gain = require('../../functions/gainExp.js');
const getEmoji = require('../../index.js');
const getTarget = require('../../functions/getTarget.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'bag',
  aliases: ['inventory', 'inv'],
  description: 'Shows your backpack',
  category: 'Cricket',
  syntax: 'e.bag',
  cooldown: 5,
  run: async ({message, args, client}) => {
    const { content, author, channel, mentions } = message;
    
    let target = getTarget(message, args, client);
    if(!target) return;
    
    const data = await db.findOne({_id: target.id});
    
    let bagItems = data.bag || {};
    
    const items = Object.keys(bagItems).map((key) => [key, bagItems[key]]);
    
    let fieldText = '';
    fieldText += `**__BackPack__**\n\n`;
    
    if(!items || items.length === 0) {
      fieldText += `Nothing here NOOB`;
    } else {
      for(const item of items) {
        const text = item;
        const emoji = await getEmoji(item[0]);
        fieldText += `**${emoji} ${text[0].charAt(0).toUpperCase() + text[0].slice(1)}** (${text[1]}) \n`;
      }
    }
    
    fieldText += `\n**__Decorations__**\n\n`;
    
    const userDecors = data.decors || {};
    const keys = Object.keys(userDecors).filter(key => key != 'equipped');
    
    //Add Equipped Decors at first;
    let equipped = userDecors.equipped;
    if(equipped.length === 0) equipped = ['none']
    let equippedReversed = [];
    equipped.forEach(decor => {
      const reverse = decor.split('_').reverse().join(' ')
      equippedReversed.push(reverse);
    });
    fieldText += '**Equipped:** ' + equippedReversed.join(', ') + '\n';
    
    if(!keys || keys.length === 0) {
      fieldText += 'None here NOOB';
    } else {
      for(const key of keys) {
        let color = key.split('_');
        let type = color.shift();
        let value = userDecors[key];
        if(color.length !== 0) type = ` ${type}`; //To adjust spacing
        fieldText += `**${color}${type}** - \`${value}\`\n`;
      }
    }
    
    const embed = await new Discord.MessageEmbed()
      .setTitle(`${target.tag}'s bag`)
      .setDescription('Pretty nice Inventory\n\n' + fieldText)
      .setFooter('Show this to your frnds!')
      .setColor(embedColor);
      
    message.reply(embed);
    await gain(data, 1.2, message);
  }
};
