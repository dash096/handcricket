const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const checkItems = require("../../functions/checkItems.js");
const trade = require('../../functions/trade.js');
const gain = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');
const getTarget = require('../../functions/getTarget.js');

module.exports = {
  name: 'send',
  aliases: ['give'],
  description: 'Send some Dogecoins or items to another user, mercy.',
  category: 'Dogenomy',
  syntax: 'e.send <@user/userId> <coin/itemName> <amount>',
  cooldown: 10,
  run: async ({message, args, client}) => {
    const { content, author, channel, mentions } = message;
    
    //User
    const user = author;
    
    //Target
    let target = await getTarget(message, args, client);
    if(!target) return;
    
    if(user.id === target.id) {
      let error = 'syntax'; let filePath = 'dogenomy/trade.js';
      message.reply(getErrors({error, filePath}));
      return;
    }
    
    //Data
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const amount = args[args.length - 1];
      
    //send @ping c/coins 1
    if(args[1].trim().toLowerCase() == 'c' || args[1].trim().toLowerCase().startsWith('coin')) {
      if(!amount || isNaN(amount)) {
        return message.reply(getErrors({error: 'syntax', filePath: 'dogenomy/trade.js'}));
      } else if (args.length === 3) {
        //send @ping item_name 1
        await trade('coins', amount, user, target, message);
      }
    } else {
      message.content = content.split(' ').slice(1).join(' ');
      const itemArray = await checkItems(message, 'dogenomy/trade.js');
      
      if(itemArray != 'err') {
        trade(itemArray[0], itemArray[1], user, target, message);
      } else {
        return;
      }
    }
    await gain(userData, 2, message);
    //Set cooldown
    const timestamps = client.cooldowns.get('send');
    timestamps.set(author.id, Date.now());
    setTimeout(() => timestamps.delete(author.id), 60 * 10 * 1000);
  }
};