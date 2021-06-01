const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getDecors = require('../functions/getDecors.js');

module.exports = async ({client, topggapi}) => {
  let votes = await topggapi.getVotes();
  
  setInterval(async () => {
    const newVotes = await topggapi.getVotes();
    
    let count = {};
    
    for (const vote of votes) {
      if(count[vote.id]) {
        count[vote.id] += 1;
      } else {
        count[vote.id] = 1;
      }
    }
    for (const newVote of newVotes) {
      if(count[newVote.id]) {
        count[newVote.id] += 1;
      } else {
        count[newVote.id] = 1;
      }
    }
    
    let newVotesArray = Object.keys(count).filter(key => count[key] % 2 === 1);
    
    if(!newVotesArray || newVotesArray.length === 0) {
      votes = newVotes;
      return;
    }
    
    for (var i = 0; i < newVotesArray.length; i++) {
      try {
        const user = await client.users.fetch(newVotesArray[i]);
        if((await topggapi.hasVoted(user.id)) === false) return;
        const cooldown = Date.now() + (60 * 60 * 12 * 1000);
        const data = await db.findOne({ _id: user.id });
        await user.send('Thanks for voting, you got ' + await rewards(data, user));
        let quests = data.quests || {};
        let streak = data.voteStreak || 0;
        quests.support = true;
        streak += 1;
        await db.findOneAndUpdate({ _id: user.id }, {
          $set: {
            voteClaim: true,
            voteCooldown: cooldown,
            quests: quests,
            voteStreak: streak,
            lastVoted: Date.now()
          }
        });
        setTimeout(async () => {
          await db.findOneAndUpdate({ _id: user.id }, {
            $set: {
              voteClaim: false,
            },
            $unset: {
              voteCooldown: false,
            }
          });
        }, 60 * 60 * 12 * 1000);
      } catch (e) {
        console.log(e);
        votes = newVotes;
        return;
      }
    }
    votes = newVotes;
  }, 60 * 2.5 * 1000); //2 and half minutes
  
};

async function rewards(data, user) {
  let reward;
  let name;
  if ((data.voteStreak) < 10) {
    reward = 'coin';
    name = 'coin';
  } else if (data.voteStreak > 0 && data.voteStreak % 25 !== 0) {
    reward = 'lootbox';
    name = 'lootbox';
  } else {
    reward = 'decor';
    name = 'sh';
  }
  
  const bag = data.bag || {};
  const decorsData = await getDecors();
  
  let newValue;
  if (reward == 'lootbox') {
    newValue = bag;
    newValue.lootbox = (bag.lootbox || 0) + 2;
  } else if (reward == 'decor') {
    let decor = decorsData[Math.floor(Math.random() * decorsData.length)];
    newValue = bag;
    newValue[decor] = (bag[decor] || 0) + 1;
  } else {
    reward = parseInt(Math.random() * 696);
    newValue = data.cc + (reward * 2);
  }
  
  if(parseInt(reward)) {
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        cc: newValue
      }
    });
  } else {
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        bag: bag
      }
    });
  }
  return `2x ${await getEmoji(name)} ${reward}`;
}