const Discord = require("discord.js");
const playerDB = require("../../schemas/player.js");
const itemDB = require("../../schemas/items.js");
const getEmoji = require('../../index.js');
const checkItems = require("../../functions/checkItems.js");
const gain = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'Cricket',
  syntax: 'e.buy <itemName> <amount>',
  cooldown: 10,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    const coinEmoji = await getEmoji('coin');
    
    //Get items
    const itemsArray = await checkItems(message);
    if(itemsArray == 'err') return;
    
    //Item Info
    const name = itemsArray[0];
    const number = itemsArray[1];
    
    //Data
    const data = await playerDB.findOne( {_id: author.id} );
    
    const item = await itemDB.findOne( {name: name} );
    
    const bag = data.bag || {};
    let oldAmount = bag[item.name] || 0;
    
    const amount = parseInt(oldAmount) + parseInt(number);
    const balance = data.cc;
    const cost = item._id * number;
    
    //Update Inventory
    bag[item.name] = amount;
    
    //Check Bal to buy.
    if(balance < cost) return message.reply('You arent rich enough to buy that much.');
    
    //Change Bag DB
    await playerDB.findOneAndUpdate(
      { _id: author.id }, 
      { $set: {bag: bag, cc: balance - cost} }, 
      { upsert: true }
    );
    
    message.channel.send(`You bought **${number} ${item.name}** for ${coinEmoji} ${cost} coins`);
    await gain(data, 1.7, message);
  }
};