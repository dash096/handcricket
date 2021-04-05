const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const questDB = require('../../schemas/quests.js');
const getEmoji = require('../../index.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'quests',
  aliases: ['task', 'tasks', 'quest'],
  description: 'Your daily tasks and to keep you interested',
  category: 'Cricket',
  syntax: 'e.quests',
  run: async (message) => {
    const { channel, author, content } = message;
    
    const tickEmoji = (await getEmoji)[5];
    const crossEmoji = (await getEmoji)[6];
    
    const data = await db.findOne({_id: author.id});
    
    checkIfCompleted(message, data);
    
    const userQuests = data.quests;
    //Status
    function beFit(name) {
      let stat;
      if(!userQuests.beFit) stat = 0;
      else stat = userQuests.beFit;
      if(userQuests.beFit == true) {
        return `${tickEmoji} **${name}** (5/5)`;
      }
      return `${crossEmoji} **${name}** (${stat}/5)`;
    }
    function support(name) {
      let stat;
      if(!userQuests.support) stat = 0;
      else stat = userQuests.support;
      if(userQuests.support == true) {
        return `${tickEmoji} **${name}** (1/1)`;
      }
      return `${crossEmoji} **${name}** (${stat}/1)`;
    }
    function tripWin(name) {
      let stat;
      if(!userQuests.tripWin) stat = 0;
      else stat = userQuests.tripWin;
      if(userQuests.tripWin == true) {
        return `${tickEmoji} **${name}** (3/3)`;
      }
      return `${crossEmoji} **${name}** (${stat}/3)`;
    }
    function duck(name) {
      let stat;
      if(!userQuests.duck) stat = 0;
      else stat = userQuests.duck;
      if(userQuests.duck == true) {
        return `${tickEmoji} **${name}** (1/1)`;
      }
      return `${crossEmoji} **${name}** (${stat}/1)`;
    }
    
    function whatQuest(Name) {
      let name = Name.charAt(0).toUpperCase() + Name.slice(1);
      if(name == 'BeFit') {
        return beFit(name);
      } else if(name == 'TripWin') {
        return tripWin(name);
      } else if(name == 'Support') {
         return support(name);
      } else if(name == 'Duck') {
         return duck(name);
      }
    }
    let text = ``;
    const quests = await questDB.find();
    for(const quest of quests) {
      const namestatus = whatQuest(quest.name);
      const name = (quest.name).charAt(0).toUpperCase() + quest.name.slice(1);
      text += `${namestatus} \`${quest.description}\`\n`;
    }
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`**${author.tag}**'s Quests`)
      .setDescription(`Here is a status of your quests\n\n${text}\n\n \`Rewards on completion of any three\` - **Lootbox**` )
      .setColor('BLUE')
      .setFooter(`Vote the bot when?`);
      
    channel.send(embed);
  }
};

async function checkIfCompleted(message, data) {
  const quests = data.quests;
  const completedOnes = Object.values(quests).filter(value => value === true);
  
  if(completedOnes.length >= 2) {
    message.reply('You have completed your daily quests and you got a lootbox');
    
    const bag = data.bag || {};
    const oldLootbox = bag.lootbox || 0;
    bag.lootbox = parseInt(oldLootbox) + 1;
    
    const quests = data.quests || {};
    const time = quests.time;
    if(time) return;
    const newTime = Date.now() + (( (60 * 60) * 12) * 1000);
    quests.time = newTime;
    
    await db.findOneAndUpdate({_id: data._id}, { $set:{ bag: bag, quests } });
    
    setTimeout(async () => {
      await db.findOneAndUpdate({_id: data._id}, { $unset: {quests: 'doesnt matter'}});
    }, newTime);
    
  } else {
    return;
  }
  
}