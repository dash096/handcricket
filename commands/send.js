const db = require("../schemas/player.js");
const Discord = require("discord.js");
const checkItems = require("../functions/checkItems.js");
const trade = require('../functions/trade.js');

module.exports = {
  name: 'send',
  aliases: ['give'],
  description: 'send some pc to another user, mercy.',
  category: 'handcricket',
  run: async ({message, args, text, client, prefix}) => {
    
    //User
    const user = message.author;
    //Data
    const userData = await db.findOne({_id: user.id});
    if(!userData) {
      return message.reply(`**${user.tag}(You)** isnt a player. Do !start`);
    }
    
    //Target
    const target = message.mentions.users.first();
    if(!target || target.bot || target.id === message.author.id) {
      return message.reply('The target is not valid.');
    }
    //Data
    const targetData = await db.findOne({_id: target.id});
    if(!targetData) {
      return message.reply(`**${target.tag}** isnt a player. Do !start`);
    }
    
    const msgObj = {};
    //send @ping c/coins 1
    if(args[1].toLowerCase() == 'c' || args[1].toLowerCase() == 'coins' || args[1].toLowerCase() == 'coin') {
      const amount = args[args.length - 1];
      
      if(!amount || isNaN(amount)) {
        return message.reply('Syntax error: "' + prefix + 'send @ping <c/coins,itemName> <amount>"');
      } else { 
        //send @ping item_name 1
        await trade('coins', amount, user, target, message);
      }
    } else {
      msgObj.content = args.join(' ');
      const itemName = await checkItems(msgObj);
      
      if(itemName != 'err') {
        console.log('Trading ' + itemName);
        trade(itemName, amount, user, target, message);
      }
    }
    
  }
};