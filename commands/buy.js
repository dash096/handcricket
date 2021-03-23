const playerDB = require("../schemas/player.js");
const itemDB = require("../schemas/items.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'handcricket',
  run: async ({message}) => {
    
    const emoji = await getEmoji
    //Content in the message (perfect)
    const args = message.content.trim().split(' ').slice(1);
    const name = args[0];
    const number = parseInt(args[1]) || 1;
    
    const item = await itemDB.findOne( {name: name} ).catch((e) => {
      console.log(e);
    });
    
    const player = await playerDB.findOne( {_id: message.author.id} ).catch(e => {
      console.log(e);
    });
    
    if (!player) {
      message.reply(message.author.tag + " is not a player. Do `!start`");
      return;
    }
    if (!item) {
      message.reply("Not a valid item!");
      return;
    }
    
    //Inventory
    const inventory = player.bag || {};
    
    //Prize
    const amount = inventory[item.amount] + number;
    const balance = player.cc;
    const cost = item._id * amount;
    
    //Update Inventory
    inventory[item.name] = amount;
    
    if(balance < cost) {
      message.reply('You arent rich enough to buy that much');
      return;
    }
    
    //Change Inventory DB
    await playerDB.findOneAndUpdate(
      { _id: message.author.id }, 
      { $set: {bag: inventory, cc: balance - cost} }, 
      { upsert: true }
    ).catch((e) => {
      if(e) {
        console.log(e);
        return;
      }
    });
    
    message.channel.send(`You bought **${amount} ${item.name}** for ${emoji} ${cost} coins`);
  }
};