const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const firstInnings = require("./duoInnings1.js");
const rollToss = require('../functions/rollToss.js');
const chooseToss = require('../functions/chooseToss.js');
const checkWill = require('../functions/checkWill.js');

module.exports = async (message, user, target) => {
  const tossEmoji = await getEmoji('toss');
  const { content, author, channel, mentions } = message;
    
  //Toss
  const roll = Math.floor(Math.random());
    
  let batsman;
  let bowler;
  
  //Flags
  let post;
  let max = 6;
  if(content.toLowerCase().includes('post')) post = true;
  if(content.toLowerCase().includes('ten')) max = 10;
  
  //Execute check will
  await channel.send(`${target} Do you wanna play cricket with **${user.username}**? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the scores in this channel`);
  
  let will = await checkWill(channel, target, post, max);
  post = will[1];
  max = will[2];
  will = will[0];
  
  //If will is true, roll the toss
  if(will === true) {
    try {
      let tossWinner = await rollToss(message, user, target, 'cricket');
      if(tossWinner.id === user.id) {
        let chosen = await chooseToss(message, user, target, 'cricket');
        if(chosen == 'err') return;
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, post, max);
      } else {
        let chosen = await chooseToss(message, target, user, 'cricket');
        if(chosen == 'err') return;
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, post, max);
      }
    } catch(e) {
      await changeStatus(user, false);
      await changeStatus(target, false);
      return console.log(e);
    }
  } else {
    await changeStatus(user, false);
    await changeStatus(target, false);
    return;
  }
};
async function start(message, batsman, bowler, post, max) {
  const { content, author, channel, mentions } = message;
  
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);
  await changeStatus(batsman, true);
  await changeStatus(bowler, true);
  firstInnings(batsman, bowler, message, post, max);
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}