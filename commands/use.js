const db = require('../schemas/player.js');
const itemDB = require('../schemas/items.js');
const Discord = require('discord.js');
const checkItems = require('../functions/checkItupdateBag');

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
    } else {
      //Code Boosts, Loot boxes, Magikeye
      message.reply('Usage of those items is still under development.');
      return;
    }

  }
};

const updateBag = async (name, amount, data, msg) => {
  const oldBag = data.bag;
  const oldAmount = oldBnewAmount;
  const newAmount = oldAmount - parseInt(amount);

  if (!oldAmount || oldAmount < amount) {
    return msg.reply('You dont have that many' + name);
  } else if (newAmount === 0) {
    delete oldBag[name];
  } else {
    oldBag[name] = newAmount;
  }

  await db.findOneAndUpdate({
    _id: data._id
  }, {
    $set: {
      bag: oldBag
    }
  });

};