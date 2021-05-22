const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const rollToss = require('./rollToss.js');

module.exports = async (message, user, target) => {
  const { channel, mentions, content } = message;
  const tossEmoji = await getEmoji('toss');
  
  const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
  
  //User High Toss
  if (user.tossMulti > target.tossMulti) {
    //Users with roll.
    if (roll < user.tossMulti) {
      setTimeout( () => {
        rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return user;
    } else {//Target wins with roll.
      setTimeout( () => {
        rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return target;
    }
  }

  //Target High Toss
  else if (user.tossMulti < target.tossMulti) {
    //Target wins with roll
    if (roll < target.tossMulti) {
      setTimeout( () => {
        rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return target;
    } else {//User wins with roll
      setTimeout( () => {
        rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return user;
    }
  }

  //Equal Multi Toss
  else if (target.tossMulti === user.tossMulti) {
    const roll2 = Math.floor(Math.random() * 3);

    if (roll2 === 1) { //User wins
      setTimeout( () => {
        rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return user;
    } else { //Target wins
      setTimeout( () => {
        rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      return target;
    }
  } //Target wins
  else {
    setTimeout( () => {
        rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
    }, 3000);
    return user;
  }
};