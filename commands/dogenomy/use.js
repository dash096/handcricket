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
const getError = require('../../functions/getErrors.js');
const getDecors = require('../../functions/getDecors.js');
const cardsDB = require('../../schemas/card.js')
const updateCards = require('../../cardFunctions/updateCards.js')
const getCardImage = require('../../cardFunctions/getImage.js')
const embedColor = require('../../functions/getEmbedColor.js')
const buySlots = require('../../cardFunctions/buySlots.js')

module.exports = {
  name: 'use',
  aliases: ['open'],
  description: 'Use an item in your bag.',
  category: 'Dogenomy',
  syntax: 'e.use <itemName>',
  cooldown: 15,
  run: async ({ message, args, prefix, client }) => {
    const { content, author, channel, mentions } = message;
    const coinsEmoji = await getEmoji('coin');

    if ((content.slice(prefix.length).trim().toLowerCase().split(/ +/))[0] === 'open') {
      if (args[0] !== 'lb' && args[0] !== 'lootbox' && args[0] !== 'loot') return;
    }

    try {
      var itemArray = await checkItems(message, 'dogenomy/use.js');
    } catch (e) {
      message.reply(e)
      return
    }

    let itemAmount = itemArray[1];
    const itemName = itemArray[0];

    let playerData = await db.findOne({ _id: author.id });

    try {
      await updateBag(itemName, itemAmount, playerData, message);
    } catch (e) {
      message.reply(e)
      return
    }

    if (itemName === 'nuts') {
      await updateStamina(author, 2);
      await message.reply('You ate some nuts and got 2 stamina!');
      return;
    } else if (itemName === 'redbull') {
      await updateStamina(author, 5);
      await message.reply('You drank a redbull and got 5 stamina!');
      return;
    } else if (itemName === 'coinboost') {
      try {
        await updateMulti(itemName, playerData, message);
      } catch (e) {
        message.reply(e)
        return;
      }
      await message.reply('Your Coin multiplier is now boosted twice!');
      return;
    } else if (itemName === 'tossboost') {
      try {
        await updateMulti(itemName, playerData, message);
      } catch (e) {
        message.reply(e)
        return;
      }
      await message.reply('Your Toss multiplier is now boosted twice!');
      return;
    } else if (itemName === 'cricketbox') {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Opening ${1} Cricket Box...`)
        .setColor(embedColor)

      let random = Math.random()

      let allCards = await cardsDB.find()
      let cards = allCards.filter(card => !playerData.cards.includes(card.fullname))
      let card = await openBox(1, playerData, message, 'cricket')

      try {
        var cachedCardURL = getCardImage(card.fullname)
        embed.setImage(cachedCardURL)
      } catch (e) {
        embed
          .attachFiles(`./assets/cards/${card.name}.png`)
          .setImage(`attachment://${card.name}.png`)
          .setTitle(`You got, ${card.name.split('-').join(' ')}`)
      }
      let msg = await message.reply(embed)
      getCardImage(card.fullname, msg.embeds[0].image.url)
      
      try {
        await updateCards(playerData, card._id, 'slots')
      } catch (e) {
        await channel.send(e)

        try {
          await checkRes()
          await updateCards(playerData, card, 'slots')
        } catch (e) {
          return
        }

        async function checkRes() {
          try {
            let msg = (await channel.awaitMessages(m => m.author.id === author.id, {
              time: 60000,
              max: 1,
              errors: ['time']
            })).first()
            let reply = msg.content.toLowerCase()

            //buy additional box
            if (reply == 'y' || reply == 'yes') {
              try {
                await buySlots(msg, playerData, 1)
                await msg.reply(`You bought a card slot for ${coinsEmoji} ${price} and got the card!`)
              } catch (e) {
                await msg.reply(e)
                return await checkRes()
              }
            } //refund used cricketbox
            else if (reply == 'n' || reply == 'no') {
              await updateBag('cricketbox', -1, playerData, message)
              await message.reply('Refunded another cricketbox.')
              throw "Refunded cricket box."
            } //check for replacement
            else {
              let removeCard = allCards.find(c => c.name == reply.split(/ +/).join('-'))

              if (removeCard) {
                if (cards.includes(removeCard)) {
                  await msg.reply('Could not find card or you dont own that. Try again.')
                  return await checkRes()
                }

                await updateCards(playerData, removeCard, 'slots', true)
                await msg.reply(`You replaced **${removeCard.fullname.split('_').join(' ')}** and got the card`)
                return
              } else {
                return await checkRes()
              }
            }
          } catch (e) {
            await updateBag('cricketbox', -1, playerData, message)
            await message.reply('Refunded another cricketbox.')
            throw "Timeout, Refunded  a cricketbox."
          }
        }
      }
    } else if (itemName === 'lootbox') {
      const msg = await message.reply(`Opening ${itemAmount || 1} lootBox!!!`);
      
      setTimeout(async () => {
        let text = '';
        for (var i = 0; i < itemAmount; i++) {
          try {
            var reward = await openBox(itemAmount, playerData, message, 'loot');
          } catch (e) {
            message.reply(e)
            return;
          }

          //decor
          if (reward == 'decor') {
            const decors = getDecors('type1');
            let decor = decors[Math.floor(Math.random() * decors.length)];
            if (decor.includes('suit')) decor = decors[Math.floor(Math.random() * decors.length)];
            text += `You got a ${await getEmoji(decor, true)} ${decor.split('_').join(' ')}!\n`;
            await updateDecor(decor, 1, playerData, message);
          } //item 
          else if (isNaN(reward)) {
            const emoji = await getEmoji(reward);
            text += `You got a **${emoji} ${reward}**\n`;
            await updateBag(reward, -1, playerData, message);
          } //coins
          else if (parseInt(reward)) {
            text += 'You got a grand amount of ' + `**${coinsEmoji} ${reward} coins!**\n`;
            await updateCoins(parseInt(reward), playerData, message);
          }
        }
        await msg.edit(text);
      }, 5000);
    }
    await gain(playerData, 2, message);

    //Set cooldown
    const timestamps = client.cooldowns.get('use');
    timestamps.set(author.id, Date.now());
    setTimeout(() => timestamps.delete(author.id), 60 * 10 * 1000);
  }
};
