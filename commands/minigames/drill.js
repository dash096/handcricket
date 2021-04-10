const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const updateCoins = require('../cricket/train.js');
const getErrors = require('../../functions/getErrors.js');

let time = 7000;
    
module.exports = {
  name: 'drill',
  aliases: 'run',
  description: 'Coach coming! Run the Drill! Exercise!',
  category: 'Minigames',
  syntax: 'e.run',
  status: true,
  run: async (message, args, prefix, client, getTrain) => {
    const { content, author, channel, mentions } = message;
    
    try {
      const coinEmoji = await getEmoji('coin');
    
      const train = getTrain || false;
    
      const randoCoins = (Math.random() * 269).toFixed(0);
    
      //Data Validation
      const data = await db.findOne({_id: author.id});
      if(!data) return message.reply(getErrors('data', author));
    
      await db.findOneAndUpdate({_id: author.id}, { $set: { status: true} } );
    
      //Difficulty
      const opt = [1,1,2,2,3];
      const roll = opt[Math.floor(Math.random() * opt.length)];
      const rando = getRando(roll); //Gets text
      
      await channel.send('The coach decided on running drill now . You will be running a 100m race . Type the upcoming message in the right order.');
      await channel.send('Ready');
      await channel.send('Go!');
      await channel.send(`Type this within ${time/1000} seconds.. \`${rando}\``);
      
      //Msg Collector
      const answers = await channel.awaitMessages(m => m.author.id === author.id, {
        max: 1,
        time: time,
        errors: ['time']
      });
      const msg = answers.first();
      const answer = answers.first().content.trim();
      const result = await checkAnswer();
      
      async function checkAnswer() {
        if(answer == rando) {
          const coins = (Math.random() * 363).toFixed(0);
          msg.reply(`Nice, You are good at running.`);
          if(train == true) msg.channel.send(`You got ${coinEmoji} ${coins} as Training rewards!`);
          return [true, randoCoins];
        } else {
          msg.reply('Looks like you need to get quicker at running. sadge..');
          return [false, randoCoins];
        }
        await gain(data, 2, message);
        return [false, 0];
      }
      
      //Set Cooldown
      if(!train) {
        const timestamps = client.cooldowns.get('drill');
        timestamps.set(author.id, Date.now());
        setTimeout(() => timestamps.delete(author.id), 60 * 1000);
      }
      
      return (result || [false, 0]);
    } catch(e) {
      console.log(e);
      message.reply(getErrors('time'));
      return [false, 1];
    } finally {
      await db.findOneAndUpdate( { _id: author.id }, { $set: { status: false} });
    }
  }
};

function getRando(difficulty) {
  let rando = [];
  const chars = ['!', '#', '@'];
  const alphs = ['a', 'e', 'i', 'o', 'u'];
  const nums = [1,2,3,4,5,6,7,8,9,0];
  
    if(difficulty == 1) {
      let i;
      for(i = 0; i < 8; i++) {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(alphs[Math.floor(Math.random() * alphs.length)]);
        if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        time = 7000;
      }
    } else if(difficulty == 2) {
      let i;
      for(i = 0; i < 11; i++) {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        if(type == 2) rando.push(chars[Math.floor(Math.random() * chars.length)]);
        time = 8500;
      }
    } else if(difficulty == 3) {
      let i;
      for(i = 0; i < 12; i++) {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(chars[Math.floor(Math.random() * chars.length)]);
        if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        time = 10000;
      }
    }
  const number = rando.join('');
  return number;
}