const fs = require('fs');
const db = require('../../schemas/player.js');

module.exports = {
  name: 'train',
  aliases: ['coach'],
  description: 'Exercise, Fitness, Be Firm',
  category: 'Cricket',
  syntax: 'e.train',
  status: true,
  cooldown: 600,
  run: async ({message, client}) => {
    const { content, author, channel, mentions } = message;
    
    try {
      const data = await db.findOne({_id: author.id});
      await db.findOneAndUpdate( { _id: author.id }, { $set: { status: true } });
    
      const exercises = {};
      const trainFiles = fs.readdirSync('./commands/minigames');
      for(const trainFile of trainFiles) {
        const file = require(`../minigames/${trainFile}`);
        exercises[file.name] = file.run; 
      }
    
      const names = Object.keys(exercises);
      let randoName = names[Math.floor(Math.random() * names.length)];
      if(randoName === 'slots') randoName = 'drill';
      const randoGame = exercises[randoName];
    
      let getTrain = true;
      const execute = await randoGame({message, client, getTrain});
    
      const win = execute[0];
      const amount = execute[1];
    
      updateCoins(message, win, amount, true);
    
      const quests = data.quests || {};
      const trainings = quests.beFit || 0;
      let newValue = parseInt(trainings) + 1;
      if(trainings !== true) {
        if(newValue === 5) {
          quests.beFit = true;
        } else {
          quests.beFit = newValue;
        }
        await db.findOneAndUpdate({ _id: author.id }, { $set: { quests: quests } } );
      }
      //Set cooldown
      const timestamps = client.cooldowns.get('train');
      timestamps.set(author.id, Date.now());
      setTimeout(() => timestamps.delete(author.id), 60 * 1000);
    } catch (e) {
      console.log(e);
    } finally {
      await db.findOneAndUpdate({_id: author.id}, { $set: { status: false } });
    }
  }
};

async function updateCoins(message, win, amount) {
  const { content, author, channel, mentions } = message;
  const data = await db.findOne({_id: author.id});
  
  let coins = amount;
  if(win == true) {
    coins = amount * 1;
  } else if (win == false) {
    coins = (amount / 2).toFixed(0);
  }
  const oldcc = data.cc;
  console.log(oldcc + parseInt(coins));
  await db.findOneAndUpdate({_id: data._id}, {$set: {cc: parseInt(oldcc) + parseInt(coins)}});
  return coins;
}