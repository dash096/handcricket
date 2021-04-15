const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const itemDB = require("../../schemas/items.js");
const getEmoji = require('../../index.js');
const checkItems = require("../../functions/checkItems.js");
const gain = require('../../functions/gainExp.js');
const updateBag = require('../../functions/updateBag.js');

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
    
    const data = await db.findOne({_id: author.id});
    const item = await itemDB.findOne({name: name});
    
    const balance = data.cc;
    const cost = item.price * number;
    
    //Check Bal to buy.
    if(balance < cost) return message.reply('You arent rich enough to buy that much.');
    
    await db.findOneAndUpdate({_id: data._id}, { $set: { cc: parseInt(balance) - parseInt(cost) } } );
    await updateBag(name, -(number), data, message);
    
    message.channel.send(`You bought **${number} ${item.name}** for ${coinEmoji} ${cost} coins`);
    await gain(data, 1.7, message);
  }
};