const Discord = require("discord.js");
const playerDB = require("../../schemas/player.js");
const itemDB = require("../../schemas/items.js");
const getEmoji = require('../../index.js');
const checkItems = require("../../functions/checkItems.js");
const gain = require('../../functions/gainExp.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'Cricket',
  syntax: 'e.buy <itemName> <amount>',
  cooldown: 10,
  run: async (message, args, prefix) => {
    const emoji = (await getEmoji)[0];
    
    //Content in the message
    const itemsArray = await checkItems(message);
    if(itemsArray == 'err') return;
    
    const name = itemsArray[0];
    const number = itemsArray[1];
    
    const player = await playerDB.findOne( {_id: message.author.id} );
    if (!player) return message.reply(message.author.tag + " is not a player. Do `" + prefix + "start`");
    
    const item = await itemDB.findOne( {name: name} );
    
    const bag = player.bag || {};
    let oldAmount = bag[item.name] || 0;
    
    const amount = parseInt(oldAmount) + parseInt(number);
    const balance = player.cc;
    const cost = item._id * number;
    
    //Update Inventory
    bag[item.name] = amount;
    
    //Check Bal to buy.
    if(balance < cost) return message.reply('You arent rich enough to buy that much.');
    
    //Change Bag DB
    await playerDB.findOneAndUpdate(
      { _id: message.author.id }, 
      { $set: {bag: bag, cc: balance - cost} }, 
      { upsert: true }
    );
    
    message.channel.send(`You bought **${number} ${item.name}** for ${emoji} ${cost} coins`);
    await gain(player, 3, message);
  }
};