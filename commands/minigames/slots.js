const Discord = require('discord.js');
const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const getDecors = require('../../functions/getDecors.js');
const getEmoji = require('../../functions/getEmoji.js');
const getItems = require('../../schemas/items.js');
const updateCoins = require('../../functions/updateCoins.js');
const getErrors = require('../../functions/getErrors.js');
const gainExp = require('../../functions/gainExp.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'slots',
  aliases: ['lottery', 'slot'],
  description: 'More money, more chance! Hope you win but legends says you will never ever win.',
  category: 'Minigames',
  syntax: 'e.slots <amount>',
  cooldown: 60,
  run: async ({ message, client, prefix }) => {
    const { content, channel, mentions, author } = message;
    
    try {
      const args = content.slice(prefix.length).trim(/ +/).split(' ').slice(1);
    
      let win = [false];
      
      const data = await db.findOne({_id: author.id});
      
      if(args.length === 0 || isNaN(args[0])) {
        let error = 'syntax'; let filePath = 'minigames/slots.js';
        return message.reply(getErrors({error, filePath}));
      }
    
      const bet = args[0];
      if(bet < 100) {
        return message.reply('Bet amount should atleast be 100, however more money more luck.');
      } else if (data.cc < bet) {
        return message.reply(`You only got ${await getEmoji('coin')} ${data.cc}, Go beg to bet that much!`);
      }
    
      const text = await getText();
    
      const split = text.split(' ');
      const what = () => {
        if(split[0] === split[1] && split[1] === split[2]) {
          const nameArgs = split[0].split(':');
          const name = nameArgs[1];
          return `A **${name}**, Woah!`;
        } else {
          return `**Nothing!** So Unlucky`;
        }
      };
      
      const slotsEmbed = new Discord.MessageEmbed()
        .setTitle('Slots')
        .setDescription('Testing your luck')
        .addField('...', `${await getEmoji('slots')} ${await getEmoji('slots')} ${await getEmoji('slots')}`)
        .setFooter(`${author.tag}'s Slots`)
        .setColor(embedColor);
        
      const resultEmbed = new Discord.MessageEmbed()
        .setTitle('Slots')
        .setDescription('Here is what you got!!! ')
        .addField(what(), text, true)
        .setFooter(`${author.tag}'s Slots`)
        .setColor(embedColor);
      
      //Set cooldowm
      const timestamps = client.cooldowns.get('slots');
      timestamps.set(author.id, Date.now());
      setTimeout(() => timestamps.delete(author.id), 60 * 1000);
      
      const slots = await message.reply(slotsEmbed);
      setTimeout(() => slots.edit(resultEmbed), 3000);
      
      await calc(bet, author);
      await gainExp(data, 1, message);
    
      async function getText() {
        const random = Math.random();
        const decideWin = () => {
          if(bet/500 > 0.35) {
            return 0.4;
          } else {
            return bet/500;
          }
        };
        const decider = decideWin();
        if(random < decider/5) {
          win = [true, 'decor'];
        } else if (random < decider) {
          win = [true, 'item'];
        }
    
        if(win[0] === true) {
          if(win[1] === 'decor') {
            const decors = getDecors('type1');
            let decor = decors[Math.floor(Math.random() * decors.length)];
            if(decor.includes('suit')) decor = decors[Math.floor(Math.random() * decors.length)];
            updateDecor(decor, author);
            return `${await getEmoji('sh')} ${await getEmoji('sh')} ${await getEmoji('sh')}`;
          } else if ( win[1] === 'item') {
            const itemsData = await getItems.find();
            const items = [];
            itemsData.forEach(itemData => {
              items.push(itemData.name);
            });
            const item = items[Math.floor(Math.random() * items.length)];
            updateItem(item, author);
            return `${await getEmoji(item)} ${await getEmoji(item)} ${await getEmoji(item)}`;
          }
        } else {
          const text = `${await getRandomEmoji()} ${await getRandomEmoji()} ${await getRandomEmoji()}`;
          const split = text.split(' ');
          if( split[0] === split[1] && split[1] === split[2]) {
            return `${split[0]} ${split[1]} ${await getEmoji('coin')}`;
          } else {
            return text;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
};

async function updateDecor(name, user) {
  const data = await db.findOne({_id: user.id});
  const decors = data.decors || {};
  const oldDecor = decors[name] || 0;
  decors[name] = oldDecor + 1;
  await db.findOneAndUpdate({_id: user.id}, { $set: { decors: decors} } );
}
async function updateItem(name, user) {
  const data = await db.findOne({_id: user.id});
  const bag = data.bag || {};
  const oldItem = bag[name] || 0;
  bag[name] = oldItem + 1;
  await db.findOneAndUpdate({_id: user.id}, { $set: { bag: bag} } );
}

async function getRandomEmoji() {
  const itemsData = await getItems.find();
  const items = [];
  itemsData.forEach(itemData => {
    items.push(itemData.name);
  });
  const item = items[Math.floor(Math.random() * items.length)];
  
  const rando = Math.random();
  if(rando < 0.25) {
    return getEmoji('sh');
  } else {
    return getEmoji(item);
  }
}

async function calc(bet, user) {
  const data = await db.findOne({_id: user.id});
  const oldBal = data.cc;
  let newBal = parseInt(oldBal) - parseInt(bet);
  await db.findOneAndUpdate( { _id: user.id }, { $set: { cc: newBal } } );
}