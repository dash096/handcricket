const fs = require('fs');
const db = require('../../schemas/player.js');
const updateCoins = require('../../functions/updateCoins.js');
const getEmoji = require('../../index.js');
const serverID = require('../../functions/getServerID.js');

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
      let multi = data.coinMulti;
      if(!multi || multi < 0.05) {
        multi = 0.1;
      }
      if(message.guild.id == serverID) {
        multi = multi * 2;
      }
      let amount = multi * 696;
      await channel.send(`You got ${await getEmoji('coin')} ${amount} for your fitness`);
      
      updateCoins(parseInt(amount), data);
    
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