const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('./getEmoji.js');
const updateStamina = require('./updateStamina.js');

module.exports = async function chooseToss(message, winner, loser, type, teamMatchPlayers) {
  const { content, author, channel, mentions } = message;
  
  let options;
  if (type === 'cricket') options = {
    'one': [['bat', 'batting'], 'Batsman'],
    'two': [['bowl', 'bowling'], 'Bowler']
  }
  else if (type === 'football') options = {
    'one': [['attack', 'atk'], 'Attacker'],
    'two': [['defend', 'def'], 'Defender']
  }
  else if (type === 'baseball') options = {
    'one': [['strike', 'str'], 'Striker'],
    'two': [['pitch', 'pit'], 'Pitcher']
  }
  
  let first;
  let second;
  
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === winner.id, { max: 1, time: 30000, errors: ['time'] }
    );
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
    
    if (c === 'end') {
      throw "Match Aborted"
    } else if (options.one[0].find(i => i === c)) {
      first = winner;
      second = loser;
    } else if (options.two[0].find(i => i === c)) {
      first = loser;
      second = winner;
    } else {
      return chooseToss(message, winner, loser, type);
    }
    
    // Update Stamina
    if (teamMatchPlayers) {
      executeUpdateStamina(teamMatchPlayers);
    } else {
      executeUpdateStamina([winner, loser]);
    }
    
    await channel.send(`${options.one[1]} is ${first}, ${options.two[1]} is ${second}`);
    return [first, second];
  } catch (e) {
    throw getErrors({error: 'time'})
    return
  }
}

async function executeUpdateStamina(arr) {
  for (let player in arr) {
    player = arr[player];
    
    updateStamina(player, -1);
  }
}