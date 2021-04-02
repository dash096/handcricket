const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const emojis = require('../../index.js');

module.exports = {
  name: 'drill',
  aliases: 'run',
  description: 'Run the Drill! Exercise!',
  category: 'Minigames',
  syntax: 'e.run',
  run: async (message, args, prefix) => {
    const emoji = (await emojis)[0];
    
    const data = await db.findOne({_id: message.author.id});
    if(!data) return message.reply('You are not a player, do ' + prefix + 'start before playing');
    
    try {
      await message.channel.send('The coach decided on running drill now . You will be running a 100m race . Type the numbers in the right order.');
      await message.channel.send('Ready');
      await message.channel.send('Go!');
      
      const rando = getRando();
      await message.channel.send(`Type the number mentioned here.. + ${rando}`);
    
      const answers = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
        max: 1,
        time: 8500,
        errors: ['time']
      });
      const msg = answers.first();
      const answer = answers.first().content.trim();
    
      if(answer == rando) {
        const coins = (Math.random() * 363).toFixed(0);
        msg.reply(`Nice, Coach awarded you! You won ${emoji} ${coins} amount of coins!`);
        updateCoins(data, coins);
      } else {
        msg.reply('Looks like you need to get quicker at running. sadge..');
      }
      await gain(data, 2, message);
    } catch(e) {
      message.reply('Time\'s up');
    }
  }
};

function getRando() {
  let rando = [];
  const nums = [1,2,3,4,5,6,7,8,9,0];
  for(const num in nums) {
    rando.push(nums[Math.floor(Math.random() * nums.length)]);
  }
  const number = rando.join('');
  return number;
}

async function updateCoins(data, amount) {
  const oldcc = data.cc;
  const cc = oldcc + parseInt(amount);
  await db.findOneAndUpdate({_id: data._id}, { $set: { cc: cc }});
}