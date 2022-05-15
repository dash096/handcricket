const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('./getEmoji.js');

module.exports = async (message, user, target, type) => {
  const { channel, mentions, content } = message;
  const tossEmoji = await getEmoji('toss');
  
  const userData = await db.findOne({ _id: user.id });
  const targetData = await db.findOne({ _id: target.id });
  
  const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
  
  const roll = Math.random();
  
  function getText(who) {
    if (who == 'user') {
      if (type === 'cricket') return `${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``;
      else if (type === 'football') return `${user} won the toss, type either \`attack\` or \`defend\` or \`end\``;
      else if (type === 'baseball') return `${user} won the toss, type either \`strike\` or \`pitch\` or \`end\``;
    } else {
      if (type === 'cricket') return `${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``;
      else if (type === 'football') return `${target} won the toss, type either \`attack\` or \`defend\` or \`end\``;
      else if (type === 'baseball') return `${target} won the toss, type either \`strike\` or \`pitch\` or \`end\``;
    }
  }
  
  let userPercent = userData.tossMulti/(userData.tossMulti+targetData.tossMulti);
  let targetPercent = 1 - userPercent

  let userWon = roll > userPercent

  setTimeout(() => {
    rolling.edit(getText(userWon ? "user" : "target"))
  }, 3000)
  
  return userWon ? user : target
}