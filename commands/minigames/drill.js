const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const emojis = require('../../index.js');
const updateCoins = require('../cricket/train.js');

    let time = 7000;
    
module.exports = {
  name: 'drill',
  aliases: 'run',
  description: 'Coach coming! Run the Drill! Exercise!',
  category: 'Minigames',
  syntax: 'e.run',
  cooldown: 60,
  run: async (message, args, prefix, getTrain) => {
    const emoji = (await emojis)[0];
    let train = getTrain || false;
    
    const data = await db.findOne({_id: message.author.id});
    if(!data) return message.reply('You are not a player, do ' + prefix + 'start before playing');
    
    const opt = [1,1,2,2,3];
    const roll = opt[Math.floor(Math.random() * opt.length)];
    
    try {
      await message.channel.send('The coach decided on running drill now . You will be running a 100m race . Type the upcoming message in the right order.');
      await message.channel.send('Ready');
      await message.channel.send('Go!');
      
      const rando = getRando(roll);
      await message.channel.send(`Type this within ${time/1000}.. \`${rando}\``);
    
      const answers = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
        max: 1,
        time: time,
        errors: ['time']
      });
      const msg = answers.first();
      const answer = answers.first().content.trim();
    
      if(answer == rando) {
        const coins = (Math.random() * 363).toFixed(0);
        msg.reply(`Nice, You are good at running.`);
        if(train ==true) msg.channel.send(`You got ${coins} as Training rewards!`);
        return [msg, true, coins];
      } else {
        msg.reply('Looks like you need to get quicker at running. sadge..');
        return [msg, false, coins];
      }
      await gain(data, 2, message);
    } catch(e) {
      message.reply('Looks like you need to get quicker at running. sadge..');
      return [message, false, 0];
    }
  }
};

function getRando(difficulty) {
  let rando = [];
  const chars = ['!', '#', '@'];
  const alphs = ['a', 'e', 'i', 'o', 'u'];
  const nums = [1,2,3,4,5,6,7,8,9,0];
  
  for(const num in nums) {
    if(difficulty == 1) {
      let i;
      const type = Math.floor(Math.random() * 4);
      if(type == 1 || type == 3) rando.push(alphs[Math.floor(Math.random() * alphs.length)]);
      if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
      time = 7000;
    } else if(difficulty == 2) {
      let i;
      const type = Math.floor(Math.random() * 4);
      if(type == 1 || type == 3) rando.push(nums[Math.floor(Math.random() * nums.length)]);
      if(type == 2) rando.push(chars[Math.floor(Math.random() * chars.length)]);
      time = 8500;
    } else if(difficulty == 3) {
      let i;
      const type = Math.floor(Math.random() * 4);
      if(type == 1 || type == 3) rando.push(chars[Math.floor(Math.random() * chars.length)]);
      if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
      time = 10000;
    }
  } 
  const number = rando.join('');
  return number;
}