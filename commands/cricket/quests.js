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
    
    const tickEmoji = await getEmoji('ok');
    const crossEmoji = await getEmoji('no');
    
    const data = await db.findOne({_id: author.id});
    
    const userQuests = data.quests;
    
    //Status
    function beFit(name) {
      let stat = userQuests.beFit || 0;
      if(stat === true) {
        return `${tickEmoji} **${name}** (5/5)`;
      } else {
        return `${crossEmoji} **${name}** (${stat}/5)`;
      }
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
      let stat = userQuests.tripWin || [0];
      if(stat[0] === true) {
        return `${tickEmoji} **${name}** (3/3)`;
      }
      return `${crossEmoji} **${name}** (${stat[0]}/3)`;
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
    
    text += `\n ${await checkIfCompleted(message, data, tickEmoji, crossEmoji)}`;
    
    let footer = getFooter(data);
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`**${author.tag}**'s Quests`)
      .setDescription(`Here is a status of your quests\n\n${text}\n\n`)
      .setColor('BLUE')
      .setFooter(footer);
      
    channel.send(embed);
  }
};

function getFooter(data) {
  quests = data.quests || {};
  if(quests.time) {
    let remainingMS = quests.time.getTime();
    let nowMS = Date.now();
    let remainingMS = remainingMS - nowMS;
    let remainingS = remainingMS/1000;
    let remainingM = remainingS/60;
    let remainingH = (remainingM/60).toFixed(0);
    let remainingMin = remainingM % 60;
    let remainingTime = `${remainingH}hours ${remainingMin}mins`
    return `Quest resets in ${remainingTime} minutes`
  } else {
    return `Finish the quest!`;
  }
}
    
async function checkIfCompleted(message, data, tick, cross) {
  const quests = data.quests || {};
  
  const completedOnes = Object.values(quests).filter(value => value === true || value[0] === true);
  
  const time = quests.time;
  
  if(time) {
    return `${tick} Claimed - **Lootbox**`;
  } else if (completedOnes.length >= 2) {
    message.reply('You have completed your daily quests and you got a lootbox');
    
    const bag = data.bag || {};
    const oldLootbox = bag.lootbox || 0;
    bag.lootbox = parseInt(oldLootbox) + 1;
    
    const xp = parseInt(data.xp);
    
    const newTime = ((60 * 60) * 12) * 1000;
    const DateTime = Date.now() + (newTime);
    const resetDate = new Date(DateTime);
    quests.time = resetDate;
    await db.findOneAndUpdate({_id: data._id}, { $set: {bag: bag, xp: xp + 6.9, quests: quests} });
    
    setTimeout(async () => {
      await db.findOneAndUpdate({_id: data._id}, { $unset: {quests: 'doesnt matter'}});
    }, newTime);
    
    return `${tick} Claimed - **Lootbox**`;
  } else {
    return `${cross} \`Rewards on completion of any three\` - **Lootbox**`;
  }
  
}