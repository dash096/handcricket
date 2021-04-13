const db = require('../../schemas/player.js');
const Discord = require('discord.js');
const checkItems = require('../../functions/checkItems.js');
const updateBag = require('../../functions/updateBag.js');
const updateMulti = require('../../functions/updateMulti.js');
const updateDecor = require('../../functions/updateDecor.js');
const updateCoins = require('../../functions/updateCoins.js');
const openBox = require('../../functions/openBox.js');
const gain = require('../../functions/gainExp.js');
const getEmoji = require('../../index.js');
const getDecors = require('../../functions/getDecors.js');

module.exports = {
  name: 'use',
  description: 'Use an item in your bag',
  category: 'Cricket',
  syntax: 'e.use <itemName>',
  cooldown: 7,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    const coinsEmoji = await getEmoji('coin');
    
    const itemArray = await checkItems(message);
    console.log(itemArray);
    
    if(itemArray == 'err') return;
    let itemAmount = itemArray[1];
    const itemName = itemArray[0];
    
    const playerData = await db.findOne({_id: author.id});
    
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
      itemAmount = 1;
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if(e1 == 'err') return;
      
      const e2 = await openBox(itemAmount, playerData, message);
      if(e2 == 'err') return;
      
      const msg = await message.reply('Opening a lootBox!!!');
      
      setTimeout( async () => {
        
        if(e2 == 'decor') {
          const decors = getDecors.type1;
          const decor = decors[Math.floor(Math.random() * decors.length)];
          await msg.edit(`Oh Damn, You got a ${decor}!`);
          updateDecor(decor, 1, playerData, message);
        }
        
        else if(isNaN(e2)) {
          const emoji = await getEmoji(e2);
          await msg.edit(`You got a **${emoji} ${e2}**`);
          updateBag(e2, -1, playerData, message);
        }
        
        else if(parseInt(e2)) {
          await msg.edit('You got a grand amount of **' + `${coinsEmoji} ${e2} coins!` + '**');
          updateCoins(parseInt(e2), playerData, message);
        }
      }, 5000);
      
    }
    //Under Construction.
    if (itemName === 'magikball'){
      message.reply('Usage of magikBall items is still under development.');
      return;
    }
    await gain(playerData, 2, message);
  }
};