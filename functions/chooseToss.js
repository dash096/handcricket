const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('./getEmoji.js');
const firstInnings = require("../cricketFunctions/duoInnings1.js");

module.exports = async function chooseToss(message, winner, loser, type) {
  const { content, author, channel, mentions } = message;
  
  let options;
  if (type === 'cricket') options = {
    'one': ['bat', 'Batsman'],
    'two': ['bowl', 'bowler']
  }
  else if (type === 'football') options = {
    'one': ['attack', 'Attacker'],
    'two': ['defend', 'Defender']
  }
  else if (type === 'baseball') options = {
    'one': ['strike', 'Striker'],
    'two': ['pitch', 'Pitcher']
  }
  
  let first;
  let second;
  
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === winner.id, { max: 1, time: 30000, errors: ['time'] }
    );
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
      
    if(options.one[0] == c) {
      first = winner;
      second = loser;
    } else if (options.two[0] == c) {
      first = loser;
      second = winner;
    } else {
      return chooseToss(message, winner, loser, type);
    }
    
    await channel.send(`${options.one[1]} is ${first}, ${options.two[1]} is ${second}`);
    return [first, second];
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