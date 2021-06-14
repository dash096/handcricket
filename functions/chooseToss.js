const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('./getEmoji.js');

module.exports = async function chooseToss(message, winner, loser, type, teamMatchPlayers) {
  const { content, author, channel, mentions } = message;
  
  let options;
  if (type === 'cricket') options = {
    'one': [['bat', 'batting'], 'Batsman'],
    'two': [['bowl', 'bowling'], 'bowler']
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
    
    if (c == 'end') {
      channel.send('Match aborted');
      await changeStatus(winner, false);
      await changeStatus(loser, false);
      return 'err';
    } else if (options.one[0].find(i => i == c)) {
      first = winner;
      second = loser;
    } else if (options.two[0].find(i => i == c)) {
      first = loser;
      second = winner;
    } else {
      return chooseToss(message, winner, loser, type);
    }
    
    // Update Stamina
    if (teamMatchPlayers) {
      updateStamina(teamMatchPlayers);
    } else {
      updateStamina([winner, loser]);
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

async function updateStamina(arr) {
  for (let player in arr) {
    player = arr[player];
    
    const data = await db.findOne({ _id: player.id });
    await db.findOneAndUpdate({ _id: data._id }, {
      $set: {
        stamina: (data.stamina - 1)
      }
    })
  }
}