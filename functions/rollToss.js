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
  
  //User High Toss
  if (userData.tossMulti > targetData.tossMulti) {
    //Users with roll.
    if (roll < userData.tossMulti) {
      setTimeout( () => {
        rolling.edit(getText('user'));
      }, 3000);
      return user;
    } else {//Target wins with roll.
      setTimeout( () => {
        rolling.edit(getText('target'));
      }, 3000);
      return target;
    }
  }

  //Target High Toss
  else if (userData.tossMulti < targetData.tossMulti) {
    //Target wins with roll
    if (roll < targetData.tossMulti) {
      setTimeout( () => {
        rolling.edit(getText('target'));
      }, 3000);
      return target;
    } else {//User wins with roll
      setTimeout( () => {
        rolling.edit(getText('user'));
      }, 3000);
      return user;
    }
  }

  //Equal Multi Toss
  else if (targetData.tossMulti === userData.tossMulti) {
    const roll2 = Math.floor(Math.random() * 3);

    if (roll2 === 1) { //User wins
      setTimeout( () => {
        rolling.edit(getText('user'));
      }, 3000);
      return user;
    } else { //Target wins
      setTimeout( () => {
        rolling.edit(getText('target'));
      }, 3000);
      return target;
    }
  } //Target wins
  else {
    setTimeout( () => {
      rolling.edit(getText('target'));
    }, 3000);
    return target;
  }
};