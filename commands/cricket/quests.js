const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const questDB = require('../../schemas/quests.js');
const getEmoji = require('../../index.js');
const updateBag = require('../../functions/updateBag.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'quests',
  aliases: ['task', 'tasks', 'quest'],
  description: 'Your daily tasks and to keep you interested',
  category: 'Cricket',
  syntax: 'e.quests',
  run: async ({ message }) => {
    const { channel, author, content } = message;
    
    const tickEmoji = await getEmoji('ok');
    const crossEmoji = await getEmoji('no');
    
    const data = await db.findOne({_id: author.id});
    
    const userQuests = data.quests || {};
    
    function getStat(name, max) {
      let stat;
      if(!userQuests || !userQuests[name]) stat = 0;
      else stat = userQuests[name];
      if(Array.isArray(stat)) stat = stat[0];
      if(stat == true) {
        return `${tickEmoji} **${name.charAt(0).toUpperCase() + name.slice(1)}** (${max}/${max})`;
      }
      return `${crossEmoji} **${name.charAt(0).toUpperCase() + name.slice(1)}** (${stat}/${max})`;
    }
    
    function whatQuest(name) {
      if(name == 'beFit') {
        return getStat(name, 5);
      } else if(name == 'tripWin') {
        return getStat(name, 3);
      } else if(name == 'support') {
         return getStat(name, 1);
      } else if(name == 'duck') {
         return getStat(name, 1);
      }
    }
    
    let text = ``;
    
    const quests = await questDB.find();
    for(const quest of quests) {
      const namestatus = whatQuest(quest.name);
      const name = (quest.name).charAt(0).toUpperCase() + quest.name.slice(1);
      text += `${namestatus} \`${quest.type}\`\n \`${quest.description}\`\n`;
    }
    
    text += `\n ${await checkIfCompleted(message, data, tickEmoji, crossEmoji)}`;
    
    let footer = getFooter(data);
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`**${author.tag}**'s Quests`)
      .setDescription(`Here is a status of your quests\n\n${text}\n\n`)
      .setColor(embedColor)
      .setFooter(footer);
      
    message.reply(embed);
  }
};

function getFooter(data) {
  quests = data.quests || {};
  if(quests.time) {
    let MS = quests.time.getTime();
    let nowMS = Date.now();
    let remainingMS = MS - nowMS;
    let remainingS = remainingMS/1000;
    let remainingM = remainingS/60;
    let remainingH = (remainingM/60).toFixed(0);
    let remainingMin = remainingM % 60;
    let remainingTime = `${remainingH} hours ${remainingMin.toFixed(0)} mins`
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
  } else if (completedOnes.length >= 3) {
    message.reply('You have completed your daily quests and you got a lootbox');
    
    const xp = parseInt(data.xp);
    
    const newTime = ((60 * 60) * 12) * 1000;
    const DateTime = Date.now() + (newTime);
    const resetDate = new Date(DateTime);
    quests.time = resetDate;
    await db.findOneAndUpdate({_id: data._id}, { $set: { xp: xp + 6.9, quests: quests } });
    await updateBag('lootbox', -1, data, message);
    
    setTimeout(async () => {
      await db.findOneAndUpdate({_id: data._id}, { $unset: {quests: 'never mind'}});
    }, newTime);
    
    return `${tick} Claimed - **Lootbox**`;
  } else {
    return `${cross} \`Rewards on completion of any three\` - **Lootbox**`;
  }
  
}