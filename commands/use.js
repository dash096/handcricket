const db = require('../schemas/player.js');
const itemDb = require('../schemas/items.js');
const Discord = require('discord.js');
const checkItems = require('../functions/checkItems.js');
const updateBag = require('../functions/updateBag.js');
const updateMulti = require('../functions/updateMulti.js');

module.exports = {
  name: 'use',
  description: 'Use an item in your bag',
  category: 'handcricket',
  run: async ({
    message
  }) => {
    const args = message.content.toLowerCase().trim().split(' ').slice(1);

    const itemArray = await checkItems(message);
    const itemAmount = itemArray[1];
    const itemName = itemArray[0];
    const itemData = await itemDb.findOne({
      name: itemName
    }).catch((e) => {
      console.log(e);
    });

    const playerData = await db.findOne({
      _id: message.author.id
    }).catch((e) => {
      console.log(e);
    });
    if (!playerData) {
      return message.reply("You arent a player. Do !start");
    }

    if (itemName === 'nuts') {
      message.reply('You ate some nuts!');
      updateBag(itemName, itemAmount, playerData, message);
      return;
    }

    if (itemName === 'redbull') {
      message.reply('You drank a redbull!');
      updateBag(itemName, itemAmount, playerData, message);
      return;
    }

    if (itemName === 'coinboost') {
      updateMulti(itemName, playerData, message);
      updateBag(itemName, itemAmount, playerData, message);
      message.reply('Your Coin multiplier is now boosted twice!');
      return;
    }

    if (itemName === 'tossboost') {
      updateMulti(itemName, playerData, message);
      updateBag(itemName, itemAmount, playerData, message);
      message.reply('Your Toss multiplier is now boosted twice!');
      return;
    } else {
      //Loot boxes, Magikeye
      message.reply('Usage of those items is still under development.');
      return;
    }

  }
};