const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const itemDB = require("../../schemas/items.js");
const getEmoji = require('../../functions/getEmoji.js');
const checkItems = require("../../functions/checkItems.js");
const gain = require('../../functions/gainExp.js');
const updateBag = require('../../functions/updateBag.js');
const updateCoins = require('../../functions/updateCoins.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop using dogecoins',
  category: 'Dogenomy',
  syntax: 'e.buy <itemName> <amount>',
  cooldown: 10,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    const coinEmoji = await getEmoji('coin');
    
    //Get items
    try {
      var itemsArray = await checkItems(message, 'dogenomy/buy.js');
    } catch (e) {
      message.reply(e)
      return
    }

    //Item Info
    const name = itemsArray[0];
    const number = itemsArray[1];
    
    const data = await db.findOne({_id: author.id});
    const item = await itemDB.findOne({name: name});
    
    const balance = data.cc;
    const cost = item.price * number;
    
    if (name == 'slots') {
      try {
        await buySlots(message, data, number)
      } catch(e) {
        message.reply(e)
        return
      }
    } else {
      if (balance < cost) return message.reply('Insufficient Balance.')
      
      await updateCoins(-parseInt(cost), data);
      await updateBag(name, -(number), data, message);
    }
    message.reply(`You bought **${number} ${item.name}** for ${coinEmoji} ${cost} coins`);
    await gain(data, 1.7, message);
  }
};