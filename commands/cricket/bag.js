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
    
    let target = await getTarget(message, args, client);
    if(!target) return;
    
    const data = await db.findOne({_id: target.id});
    let bagItems = data.bag || {};
    
    const bagEmbed = await new Discord.MessageEmbed()
      .setTitle(`${target.username}'s bag`)
      .setDescription('The bag looks so pro\n\n' + await getItemsFieldText())
      .setFooter('🔨 for items and 👗 for decors')
      .setColor(embedColor);
    const decorEmbed = await new Discord.MessageEmbed()
      .setTitle(`${target.username}'s wardrobe`)
      .setDescription('The wardrobe looks so pro\n\n' + await getDecorsFieldText())
      .setFooter('🔨 for items and 👗 for decors')
      .setColor(embedColor);
    
    const bagMessage = await message.reply('Loading');
      await bagMessage.react('🔨');
      await bagMessage.react('👗');
      await bagMessage.react('❌');
      await bagMessage.edit(null, { embed: bagEmbed });
    
    const collector = await bagMessage.createReactionCollector((reaction, user) => user.id === author.id);
    
    collector.on('collect', async (reaction, user) => {
      if (reaction.emoji.name == '🔨') {
        await bagMessage.edit(bagEmbed);
      } else if (reaction.emoji.name == '👗') {
        await bagMessage.edit(decorEmbed);
      } else {
        await bagMessage.delete();
      }
    });
    
    
    await gain(data, 0.3, message);
    
    async function getItemsFieldText() {
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
      return fieldText;
    }
    
    async function getDecorsFieldText() {
      let fieldText = '';
      
      fieldText += `\n**__Decorations__**\n\n`;
      
      const userDecors = data.decors || {};
      const keys = Object.keys(userDecors).filter(key => key != 'equipped');
      
      //Add Equipped Decors at first;
      let equipped = userDecors.equipped || [];
      if(equipped.length === 0) equipped = ['none'];
      let equippedReversed = [];
      equipped.forEach(decor => {
        if(decor.includes('suit')) return equippedReversed.push(`${(decor.split('_'))[1]} suit`);
        const reverse = decor.split('_').reverse().join(' ');
        equippedReversed.push(reverse);
      });
      fieldText += '**Equipped:** ' + equippedReversed.join(', ') + '\n';
      
      if(!keys || keys.length === 0) {
        fieldText += 'None here NOOB';
      } else {
        keys.forEach(key => {
          if(key.includes('suit')) return fieldText += `**${(key.split('_'))[1]} suit** - \`${userDecors[key]}\`\n`;
          let color = key.split('_');
          let type = color.shift();
          let value = userDecors[key];
          if(color.length !== 0) type = ` ${type}`; //To adjust spacing
          fieldText += `**${color}${type}** - \`${value}\`\n`;
        });
      }
      return fieldText;
    }
  }
};
