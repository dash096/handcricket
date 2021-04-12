const votesDB = require('../schemas/votesAndUsers.js');
const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async ({client, topggapi}) => {
  let votes = await topggapi.getVotes();
  await votesDB.findOneAndUpdate({name: 'votes'}, {$set: {array: votes}});
  
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
      console.log('No votes');
      votes = newVotes;
      return;
    }
    
    console.log(newVotesArray);
    
    for (var i = 0; i < newVotesArray.length; i++) {
      const user = await client.users.fetch(newVotesArray[i]);
      const nextVoteTime = Date.now() + (((60 * 60) * 12) * 1000);
      const data = await db.findOne({_id: user.id});
      try {
        user.send('Thanks for voting, you got ' + await rewards(user));
        await db.findOneAndUpdate({ _id: user.id }, { $set: {voteClaim: true, voteCooldown: nextVoteTime }});
      } catch (e) {
        votes = newVotes;
        return;
      }
    }
    votes = newVotes;
  }, 30 * 1000);
  
};

async function rewards(user) {
  const data = await db.findOne({_id: user.id});
  await db.findOneAndUpdate({_id: user.id}, {$set: {cc: data.cc + 250}});
  return `${await getEmoji('coin')} 250`;
}