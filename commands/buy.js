

const playerDB = require("../schemas/player.js");
const itemDB = require("../schemas/items.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'handcricket',
  run: async ({message}) => {
    
    //Content in the message (perfect)
    const args = message.content.trim().split(' ').slice(1);
    const name = args[0];
    const amount = parseInt(args[1]) || 1;
    
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
    
    console.log(player.bag);
    
    const bagObject = player.bag;
    
    bagObject.name = amount;
    
    await console.log(bagObject);
    //await db.findOneAndUpdate({_id: mesage.author.id}, { $set: {bag} }, {upsert: true})
    
  }
};