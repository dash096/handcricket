const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const checkItems = require("../../functions/checkItems.js");
const trade = require('../../functions/trade.js');
const gain = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'send',
  aliases: ['give'],
  description: 'send some pc to another user, mercy.',
  category: 'Cricket',
  syntax: 'e.send @user <coins/itemName> <amount>',
  cooldown: 10,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    
    const args = content.toLowerCase().trim().split(' ').slice(1);
    
    //User
    const user = author;
    
    //Target
    const target = mentions.users.first();
    if(!target || target.bot || target.id === author.id) return message.reply('The target is not valid.');
    
    //Data
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const amount = args[args.length - 1];
      
    //send @ping c/coins 1
    if(args[1].toLowerCase() == 'c' || args[1].toLowerCase() == 'coin') {
      if(!amount || isNaN(amount)) {
        let error = 'syntax';
        let filePath = 'cricket/trade.js';
        return message.reply(getErrors({error, filePath}));
      } else if (args.length === 3) { 
        //send @ping item_name 1
        await trade('coins', amount, user, target, message);
      }
    } else {
      message.content = content.split(' ').slice(1).join(' ');
      const itemName = await checkItems(message, 'cricket/trade.js');
      
      if(itemName != 'err') {
        trade(itemName, amount, user, target, message);
      } else {
        return;
      }
    }
    await gain(userData, 2, message);
  }
};