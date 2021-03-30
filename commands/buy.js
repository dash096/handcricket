const playerDB = require("../schemas/player.js");
const itemDB = require("../schemas/items.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const checkItems = require("../functions/checkItems.js");
const gain = require('../functions/gainExp.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'handcricet',
  cooldown: '10s',
  run: async ({message, args, text, client, prefix}) => {
    
    const emoji = await getEmoji;
    
    //Content in the message
    const arr = await checkItems(message);
    if(arr == 'err') {
      return;
    }
    
    const itemsArray = arr;
    const name = itemsArray[0];
    const number = itemsArray[1];
    
    const player = await playerDB.findOne( {_id: message.author.id} ).catch(e => {
      console.log(e);
    });
    const item = await itemDB.findOne( {name: name} ).catch(e => {
      console.log(e);
    });
    
    if (!player) { //Validation
      message.reply(message.author.tag + " is not a player. Do `" + prefix + "start`");
      return;
    }
    
    //Inventory
    const bag = player.bag || {};
    
    //OldAmount
    let oldAmount = bag[item.name];
    if(!oldAmount) oldAmount = 0;
    
    //Cost of Buying
    const amount = parseInt(oldAmount) + parseInt(number);
    const balance = player.cc;
    const cost = item._id * number;
    
    //Update Inventory
    bag[item.name] = amount;
    
    if(balance < cost) {
      message.reply('You arent rich enough to buy that much.');
      return;
    }
    
    //Change Bag DB
    await playerDB.findOneAndUpdate(
      { _id: message.author.id }, 
      { $set: {bag: bag, cc: balance - cost} }, 
      { upsert: true }
    ).catch((e) => {
      if(e) {
        console.log(e);
        return;
      }
    });
    
    message.channel.send(`You bought **${number} ${item.name}** for ${emoji} ${cost} coins`);
    await gain(player, 3);
  }
};