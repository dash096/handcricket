const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");

module.exports = async function chooseToss(message, winner, loser) {
  const { content, author, channel, mentions } = message;
  
  let batsman;
  let bowler;
  
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === winner.id, { max: 1, time: 30000, errors: ['time'] }
    );
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
      
    if (c.startsWith("batting")) {
      batsman = winner;
      bowler = loser;
    } else if (c.startsWith("bowling")) {
      batsman = loser;
      bowler = winner;
    } else if (c == "end" || c == "cancel" || c == "exit") {
      await changeStatus(winner, false);
      await changeStatus(loser, false);
      channel.send('Aborted');
      return 'err';
    } else {
      m.reply("Type either `batting` or `bowling`");
      return chooseToss(message, winner, loser);
    }
    await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    return [batsman, bowler];
  } catch (e) {
    await changeStatus(winner, false);
    await changeStatus(loser, false);
    channel.send(getErrors({error: 'time'}));
    return console.log(e);
  }
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}