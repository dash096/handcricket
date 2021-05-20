const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const itemDB = require("../../schemas/items.js");
const getEmoji = require('../../index.js');
const checkItems = require("../../functions/checkItems.js");
const gain = require('../../functions/gainExp.js');
const updateBag = require('../../functions/updateBag.js');

module.exports = {
  name: 'sell',
  description: 'Sell items and get coins back, not 100% cashback ofc.',
  category: 'Cricket',
  syntax: 'e.sell <itemName> <amount>',
  cooldown: 10,
  run: async ({message}) => {
    const { author, content, channel, mentions } = message;
    
    const itemsArray = await checkItems(message, 'cricket/sell.js');
    if(itemsArray == 'err') return;
    
    const itemName = itemsArray[0];
    const itemAmount = itemsArray[1];
    const itemEmoji = await getEmoji(itemName);
    const itemPrice = (await itemDB.findOne({ name: itemName })).price;
    
    const data = await db.findOne({ _id: author.id });
    const itemBalance = (data.bag)[itemName] || 0;
    
    if(itemBalance < itemAmount) {
      message.reply(`You dont have that many ${itemEmoji} ${itemName}`);
      return;
    }
    
    const newBalance = data.cc + (itemPrice * 69/100) * itemAmount;
    
    await updateBag(itemName, itemAmount, data, message);
    await db.findOneAndUpdate({ _id: author.id }, { $set: { cc: parseInt(newBalance) } } );
    
    message.reply(`You sold ${itemAmount} ${itemEmoji} ${itemName} for ${await getEmoji('coin')} ${parseInt((itemPrice * 69/100) * itemAmount)} coins`);
    return;
  }
}