const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('./getEmoji.js');
const firstInnings = require("../cricketFunctions/duoInnings1.js");

module.exports = async function chooseToss(message, winner, loser, football) {
  const { content, author, channel, mentions } = message;
  
  let batsman;
  let bowler;
  
  let attacker;
  let defender;
  
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === winner.id, { max: 1, time: 30000, errors: ['time'] }
    );
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
      
    if(football && c.startsWith("attack")) {
      attacker = winner;
      defender = loser;
    } else if (football && c.startsWith("defend")) {
      attacker = loser;
      defender = winner;
    } else if (!football && c.startsWith("batting")) {
      batsman = winner;
      bowler = loser;
    } else if (!football && c.startsWith("bowling")) {
      batsman = loser;
      bowler = winner;
    } else if (c == "end" || c == "cancel" || c == "exit") {
      await changeStatus(winner, false);
      await changeStatus(loser, false);
      channel.send('Aborted');
      return 'err';
    } else {
      return chooseToss(message, winner, loser, football);
    }
    
    if(!football) {
      await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
      return [batsman, bowler];
    } else {
      await channel.send(`Attacker is ${attacker}, Defender is ${defender}`);
      return [attacker, defender];
    }
  } catch (e) {
    await changeStatus(winner, false);
    await changeStatus(loser, false);
    channel.send(getErrors({error: 'time'}));
    console.log(e);
    return 'err'
  }
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}