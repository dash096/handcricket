const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

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
        await user.send('Thanks for voting, you got ' + await rewards(user));
        let quests = data.quests || {};
        let streak = data.voteStreak || 0;
        quests.support = true;
        streak += 1;
        await db.findOneAndUpdate({ _id: user.id }, {
          $set: {
            voteClaim: true,
            voteCooldown: cooldown,
            quests: quests,
            voteStreak: streak
          }
        });
      } catch (e) {
        console.log(e);
        votes = newVotes;
        return;
      }
    }
    votes = newVotes;
  }, 60 * 2.5 * 1000); //2 and half minutes
  
};

async function rewards(user) {
  const data = await db.findOne({_id: user.id});
  const bag = data.bag || {};
  const lootbox = bag.lootbox || 0;
  bag.lootbox = lootbox + 1;
  await db.findOneAndUpdate({_id: user.id}, {$set: {bag: bag}});
  return `${await getEmoji('lootbox')} lootbox`;
}