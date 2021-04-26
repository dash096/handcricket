const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const rollToss = require('./rollToss.js');
const chooseToss = require('./chooseToss.js');

module.exports = async (message, user, target) => {
  const tossEmoji = await getEmoji('toss');
  const { content, author, channel, mentions } = message;
    
  //Toss
  const roll = Math.floor(Math.random());
    
  let batsman;
  let bowler;
  
  //Check if to post socres in the channel.
  let post = false;
  if(content.toLowerCase().includes('post')) post = true;
    
  await channel.send(`<@${target.id}> Do you wanna play with **${user.username}**? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the scores in this channel`);
    
  //Execute check will
  const will = await checkWill();
    
  //Ask the target if he wants to duel.
  async function checkWill() {
    try {
      const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
        max: 1,
        time: 17000,
        errors: ['time']
      });
      const msg = msgs.first();
      const c = msg.content.trim().toLowerCase();
      
      if(c.includes('post')) post = true;
        
      if(c.startsWith('y')) {
        return true;
      }
      else if(c.startsWith('n')){
        msg.reply(`Match aborted`);
        return false;
      } else {
        msg.reply(`Type either \`y\`/\`n\``);
        return await checkWill();
      }
    } catch(e) {
      let error = 'time';
      channel.send(getErrors({error}));
      return console.log(e);
    }
  }
    
  //If will is true, roll the toss
  if(will === true) {
    try {
      let tossWinner = await rollToss(message, user, target, post, batsman, bowler);
      if(tossWinner.id === user.id) {
        let chosen = await chooseToss(message, user, target);
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, post);
      } else {
        let chosen = await chooseToss(message, target, user);
        let batsman = chosen[0];
        let bowler = chosen[1];
        start(message, batsman, bowler, post);
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
async function start(message, batsman, bowler, post) {
  const { content, author, channel, mentions } = message;
  
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);
  await changeStatus(batsman, true);
  await changeStatus(bowler, true);
  firstInnings(batsman, bowler, message, post);
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}