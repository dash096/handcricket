const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const startInnings = require("./duoInnings.js");
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
  let flags = {
    post: undefined,
    max: 6,
    wickets: 1,
    overs: 5,
  }
  if(content.toLowerCase().includes('--post')) flags.post = true;
  if(content.toLowerCase().includes('--ten')) flags.max = 10;
  if(content.toLowerCase().includes('--wickets')) {
    let wickets = content[(/--wickets/.exec(content)).index + 9];
    if (!wickets || isNaN(wickets)) {
      return message.reply('Invalid Value for Flag Wickets and it is set to 1 as default.');
    } else if (wickets > 5) {
      flags.wickets = 5;
      message.reply('Limited wickets for a duoMatch is 1-5, it is now set to 5');
    } else {
      flags.wickets = wickets;
    }
  }
  if(content.toLowerCase().includes('--overs')) {
    let overs = content[(/--overs/.exec(content)).index + 7];
    if (!overs || isNaN(overs)) {
      message.reply('Invalid Value for Flag Overs and it is set to 5 as default.');
    } else if (overs > 5) {
      flags.overs = 5;
      message.reply('Limited overs for a duoMatch is 1-5, it is now set to 5');
    } else {
      flags.overs = overs;
    }
  }
  
  //Execute check will
  await channel.send(`${target} Do you wanna play cricket with **${user.username}**? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the scores in this channel`);
  
  let will = await checkWill(channel, target, flags.post, flags.max, flags.wickets || 1, flags.overs || 5);
  flags.post = will[1];
  flags.max = will[2];
  flags.wickets = will[3] || 1;
  flags.overs = will[4] || 5;
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
        start(message, batsman, bowler, flags);
      } else {
        let chosen = await chooseToss(message, target, user, 'cricket');
        if(chosen == 'err') return;
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, flags);
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
async function start(message, batsman, bowler, flags) {
  const { content, author, channel, mentions } = message;
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);
  await changeStatus(batsman, true);
  await changeStatus(bowler, true);
  startInnings(batsman, bowler, message, flags);
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}