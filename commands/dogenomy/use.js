const db = require('../../schemas/player.js');
const Discord = require('discord.js');
const checkItems = require('../../functions/checkItems.js');
const updateBag = require('../../functions/updateBag.js');
const updateMulti = require('../../functions/updateMulti.js');
const updateDecor = require('../../functions/updateDecor.js');
const updateCoins = require('../../functions/updateCoins.js');
const updateStamina = require('../../functions/updateStamina.js');
const openBox = require('../../functions/openBox.js');
const gain = require('../../functions/gainExp.js');
const getEmoji = require('../../functions/getEmoji.js');
const getDecors = require('../../functions/getDecors.js');
const getCards = require('../../cardFunctions/getCards.js')
const updateCards = require('../../cardFunctions/updateCards.js')
const getCardImage = require('../../cardFunctions/getImage.js')

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
    
    
    if (itemName === 'nuts') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e == 'err') return;
      await updateStamina(author, 2);
      await message.reply('You ate some nuts and got 2 stamina!');
      return;
    } else if (itemName === 'redbull') {
      const e = await updateBag(itemName, itemAmount, playerData, message);
      if(e == 'err') return;
      await updateStamina(author, 5);
      await message.reply('You drank a redbull and got 5 stamina!');
      return;
    } else if (itemName === 'coinboost') {
      const e1 = await updateBag(itemName, 1, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      await message.reply('Your Coin multiplier is now boosted twice!');
      return;
    } else if (itemName === 'tossboost') {
      const e1 = await updateBag(itemName, 1, playerData, message);
      if (e1 == 'err') return;
      const e2 = await updateMulti(itemName, playerData, message);
      if(e2 == 'err') return;
      await message.reply('Your Toss multiplier is now boosted twice!');
      return;
    } else if (itemName === 'cricketbox') {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if(e1 == 'err') return;
      
      const embed = new Discord.MessageEmbed()
        .setTitle(`Opening ${1} Cricket Box...`)
      const msg = await message.reply(embed)
      
      setTimeout( async () => {
        let cards = await getCards()
        let card = cards[Math.floor(Math.random() * cards.length)]
        let playerCards = playerData.cards || {}
        await updateCards(playerData, card)
        /*
        TODO: check the slots left
        */
        let cachedCardURL = getCardImage(card.fullname) 
        if (cachedCardURL !== 'err') {
          embed.setImage(cachedCardURL)
        } else {
          embed.setTitle(`You got ${card.name.split('-').join(' ')}`)
          embed.attachFiles(`assets/cards/${card.name}`)
          embed.setImage(`attachment://${card.name}`)
        }
        await msg.edit(embed)
        if(!cachedCardURL) getCardImage(
          card.fullname,
          msg.attachments.first().url
        )
      }, 5000)
    } else if (itemName === 'lootbox' ) {
      const e1 = await updateBag(itemName, itemAmount, playerData, message);
      if(e1 == 'err') return;
          
      const msg = await message.reply(`Opening ${itemAmount || 1} lootBox!!!`);
      setTimeout( async () => {
        let text = '';
        for(var i = 0; i < itemAmount; i++) {
          let e2 = await openBox(itemAmount, playerData, message, 'loot');
          if(e2 == 'err') return;
          
          //decor
          if(e2 == 'decor') {
            const decors = getDecors('type1');
            let decor = decors[Math.floor(Math.random() * decors.length)];
            if(decor.includes('suit')) decor = decors[Math.floor(Math.random() * decors.length)];
            text += `You got a ${await getEmoji(decor, true)} ${decor.split('_').join(' ')}!\n`;
            await updateDecor(decor, 1, playerData, message);
          } //item
          else if(isNaN(e2)) {
            const emoji = await getEmoji(e2);
            text += `You got a **${emoji} ${e2}**\n`;
            await updateBag(e2, -1, playerData, message);
          } //coins
          else if(parseInt(e2)) {
            text += 'You got a grand amount of ' + `**${coinsEmoji} ${e2} coins!**\n`;
            await updateCoins(parseInt(e2), playerData, message);
          }
        }
        await msg.edit(text);
      }, 5000);
    }
    await gain(playerData, 2, message);
  }
};