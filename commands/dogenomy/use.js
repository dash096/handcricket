const db = require('../../schemas/player.js');
const Discord = require('discord.js');
const checkItems = require('../../functions/checkItems.js');
const updateBag = require('../../functions/updateBag.js');
const updateMulti = require('../../functions/updateMulti.js');
const updateDecor = require('../../functions/updateDecor.js');
const updateCoins = require('../../functions/updateCoins.js');
const openBox = require('../../functions/openBox.js');
const gain = require('../../functions/gainExp.js');
const getEmoji = require('../../functions/getEmoji.js');
const getDecors = require('../../functions/getDecors.js');

module.exports = {
  name: 'use',
  aliases: ['open'],
  description: 'Use an item in your bag',
  category: 'Dogenomy',
  syntax: 'e.use <itemName>',
  cooldown: 7,
  run: async ({message, args, prefix}) => {
    const { content, author, channel, mentions } = message;
    const coinsEmoji = await getEmoji('coin');
    if((content.slice(prefix.length).trim().toLowerCase().split(/ +/))[0] === 'open') {
      if(args[0] !== 'lb' && args[0] !== 'lootbox' && args[0] !== 'loot') return;
    }
    
    const itemArray = await checkItems(message, 'dogenomy/use.js');
    
    if(itemArray == 'err') return;
    let itemAmount = itemArray[1];
    const itemName = itemArray[0];
    
    const playerData = await db.findOne({_id: author.id});
    
    
    //Under Dms only.
    if (itemName === 'magikball' || itemName === 'dots'){
      message.reply('It is a powerup and can only be used in duoMatches.');
      return;
    } else if (itemName === 'nuts') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e != 'err') message.reply('You ate some nuts!');
      return;
    } else if (itemName === 'redbull') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e != 'err') message.reply('You drank a redbull!');
      return;
    } else if (itemName === 'coinboost') {
      const e1 = await updateBag(itemName, 1, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      if(e2 != 'err' && e1 != 'err') message.reply('Your Coin multiplier is now boosted twice!');
      return;
    } else if (itemName === 'tossboost') {
      const e1 = await updateBag(itemName, 1, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      if(e2 != 'err' && e1 != 'err') message.reply('Your Toss multiplier is now boosted twice!');
      return;
    } else if (itemName === 'lootbox' ) {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if(e1 == 'err') return;
          
      const msg = await message.reply(`Opening ${itemAmount || 1} lootBox!!!`);
      
      setTimeout( async () => {
        let text = '';
        for(var i = 0; i < itemAmount; i++) {
          let e2 = await openBox(itemAmount, playerData, message);
          if(e2 == 'err') return;
          
          if(e2 == 'decor') {
            const decors = getDecors('type1');
            let decor = decors[Math.floor(Math.random() * decors.length)];
            if(decor.includes('suit')) decor = decors[Math.floor(Math.random() * decors.length)];
            text += `Oh Damn, You got a ${await getEmoji(decor, true)} ${decor.split('_').join(' ')}!\n`;
            updateDecor(decor, 1, playerData, message);
          }
        
          else if(isNaN(e2)) {
            const emoji = await getEmoji(e2);
            text += `You got a **${emoji} ${e2}**\n`;
            updateBag(e2, -1, playerData, message);
          }
        
          else if(parseInt(e2)) {
            text += 'You got a grand amount of ' + `**${coinsEmoji} ${e2} coins!**\n`;
            updateCoins(parseInt(e2), playerData, message);
          }
        }
        await msg.edit(text);
      }, 5000);
    }
    await gain(playerData, 2, message);
  }
};