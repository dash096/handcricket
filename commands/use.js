const db = require('../schemas/player.js');
const itemDb = require('../schemas/items.js');
const Discord = require('discord.js');
const checkItems = require('../functions/checkItems.js');
const updateBag = require('../functions/updateBag.js');
const updateMulti = require('../functions/updateMulti.js');
const openBox = require('../functions/openBox.js');
const getEmoji = require('../index.js');

module.exports = {
  name: 'use',
  description: 'Use an item in your bag',
  category: 'handcricket',
  cooldown: '15s',
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
      return message.reply("You arent a player. Do " + prefix + "start");
    }

    if (itemName === 'nuts') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e != 'err') message.reply('You ate some nuts!');
      return;
    }

    else if (itemName === 'redbull') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e != 'err') message.reply('You drank a redbull!');
      return;
    }

    else if (itemName === 'coinboost') {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      if(e2 != 'err' && e1 != 'err') message.reply('Your Coin multiplier is now boosted twice!');
      return;
    }

    else if (itemName === 'tossboost') {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      if(e2 != 'err' && e1 != 'err') message.reply('Your Toss multiplier is now boosted twice!');
      return;
    } 
    
    else if (itemName === 'lootbox' ) {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if(e1 == 'err') return;
      const e2 = await openBox(itemName, itemAmount, playerData, message);
      if(e2 == 'err') return;
      
      const msg = await message.reply('Opening a lootBox!!!');
      
      setTimeout( async () => {
        console.log(e2);
        if(isNaN(e2)) {
          await msg.edit('You got a **' + e2 + '**');
          updateItem(e2, 1, playerData, message)
        }
        
        else if(parseInt(e2)) {
          const emoji = await getEmoji;
          await msg.edit('You got a grand amount of **' + `${emoji} ${e2} coins!` + '**');
          updateCoins(parseInt(e2), playerData, message);
        }
      }, 5000);
      
    }
    //Under Construction.
    if (itemName === 'magikball'){
      message.reply('Usage of magikBall items is still under development.');
      return;
    }

  }
};

async function updateCoins(amount, data, msg) {
  const oldBal = data.cc;
  await db.findOneAndUpdate({_id: data._id}, { $set: {cc: oldBal + amount} });
}

async function updateItem(itemName, amount, data, message) {
  let bag = data.bag;
  if(!bag) bag = {};
  
  let oldAmount = bag[itemName];
  if (!oldAmount) oldAmount = 0;
  
  bag[itemName] = amount;
  
  await db.findOneAndUpdate({_id: data._id}, {$set: { bag: bag }});
}