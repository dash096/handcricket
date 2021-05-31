const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const rollToss = require('../functions/rollToss.js');
const chooseToss = require('../functions/chooseToss.js');

module.exports = async (message, user, target) => {
  const tossEmoji = await getEmoji('toss');
  const { content, author, channel, mentions } = message;
    
  //Toss
  const roll = Math.floor(Math.random());
    
  let batsman;
  let bowler;
  
  //Flags
  let post = false;
  let max = 6;
  if(content.toLowerCase().includes('post')) post = true;
  if(content.toLowerCase().includes('ten')) max = 10;
  
  //Execute check will
  await channel.send(`${target} Do you wanna play cricket with **${user.username}**? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the scores in this channel`);
  const will = await checkWill();
    
  //Ask the target if he wants to duel.
  async function checkWill() {
    try {
      const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
        max: 1,
        time: 30000,
        errors: ['time']
      });
      const msg = msgs.first();
      const c = msg.content.trim().toLowerCase();
      
      if(c.includes('post')) post = true;
      if(c.includes('ten')) max = 10;
      
      if(c.startsWith('y')) {
        return true;
      }
      else if(c.startsWith('n')){
        msg.reply(`Match aborted`);
        return false;
      } else {
        return await checkWill();
      }
    } catch(e) {
      message.reply(getErrors({error: 'time'}));
      console.log(e);
      return false;
    }
  }
    
  //If will is true, roll the toss
  if(will === true) {
    try {
      let tossWinner = await rollToss(message, user, target);
      if(tossWinner.id === user.id) {
        let chosen = await chooseToss(message, user, target);
        if(chosen == 'err') return;
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, post, max);
      } else {
        let chosen = await chooseToss(message, target, user);
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