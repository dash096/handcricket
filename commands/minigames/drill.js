const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const updateCoins = require('../../functions/updateCoins.js');
const getErrors = require('../../functions/getErrors.js');

let time = 7000;
    
module.exports = {
  name: 'drill',
  aliases: ['run'],
  description: 'Coach coming! Run the Drill! Exercise!',
  category: 'Minigames',
  syntax: 'e.run',
  status: true,
  cooldown: 60,
  run: async ({message, client, getTrain}) => {
    const { content, author, channel, mentions } = message;
    
    try {
      const coinEmoji = await getEmoji('coin');
    
      const train = getTrain || false;
    
      //Data Validation
      const data = await db.findOne({_id: author.id});
      if(!data) {
        let error = 'data';
        let user = author;
        message.reply(getErrors({error, user}));
      }
      await db.findOneAndUpdate({_id: author.id}, { $set: { status: true} } );
    
      //Difficulty
      const opt = [1,1,2,2,3];
      const roll = opt[Math.floor(Math.random() * opt.length)];
      const rando = await getRando(roll); //Gets text
      
      await message.reply('The coach decided on running drill now . You will be running a 100m race . Type the upcoming message in the right order.');
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
        } else {
          msg.reply('Looks like you need to get quicker at running. sadge..');
        }
        await gain(data, 2, message);
      }
      
      //Set Cooldown
      if(!getTrain) {
        const timestamps = client.cooldowns.get('drill');
        timestamps.set(author.id, Date.now());
        setTimeout(() => timestamps.delete(author.id), 60 * 1000);
      }
      
      return;
    } catch(e) {
      message.reply(getErrors({error: 'time'}));
    } finally {
      await db.findOneAndUpdate( { _id: author.id }, { $set: { status: false} });
      return;
    }
  }
};

async function getRando(difficulty) {
  let rando = [];
  const chars = ['!', '#', '@'];
  const alphs = ['a', 'e', 'i', 'o', 'u'];
  const nums = [1,2,3,4,5,6,7,8,9,0];
  
  await pushRando();
  async function pushRando() {
    if(difficulty == 1) {
      let i;
      let arr = [0,1,2,3,4,5,6,7,8];
      await arr.forEach(() => {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(alphs[Math.floor(Math.random() * alphs.length)]);
        if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        time = 7000;
      });
    } else if(difficulty == 2) {
      let i;
      let arr = [0,1,2,3,4,5,6,7,8,9,10];
      await arr.forEach(() => {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        if(type == 2) rando.push(chars[Math.floor(Math.random() * chars.length)]);
        time = 8500;
      });
    } else if(difficulty == 3) {
      let i;
      let arr = [0,1,2,3,4,5,6,7,8,9,10,11];
      await arr.forEach(() => {
        const type = Math.floor(Math.random() * 4);
        if(type == 1 || type == 3) rando.push(chars[Math.floor(Math.random() * chars.length)]);
        if(type == 2) rando.push(nums[Math.floor(Math.random() * nums.length)]);
        time = 10000;
      });
    }
  }
  const number = rando.join('');
  return number;
}