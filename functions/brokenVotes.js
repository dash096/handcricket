const votesDB = require('../schemas/votesAndUsers.js');
const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async ({client, topggapi}) => {
  const greaterCooldown = await db.find({voteCooldown: { $gte: Date.now() }});
  const lesserCooldown = await db.find({voteCooldown: { $lte: Date.now() }});
  
  if(!greaterCooldown || greaterCooldown.length === 1) {
    console.log('0 toFixVotes found');
  } else {
    console.log(greaterCooldown.length + ' toFixVotes found');
    fixVotes();
  }
  if(!lesserCooldown || lesserCooldown.length === 1) {
    console.log('0 brokeVotes found');
  } else {
    console.log(lesserCooldown.length + ' brokeVotes found');
    brokeVotes();
  }
  
  function brokeVotes() {
    for(const data of lesserCooldown) {
      brokeVote(data);
    }
  }
  function fixVotes() {
    for(const data of greaterCooldown) {
      fixVote(data);
    }
  }
  async function brokeVote(data) {
    const user = await client.users.fetch(data._id);
    user.send('Your vote timer has refreshed, you can vote here: ' + 'https://top.gg/bot/804346878027235398/vote');
    await db.findOneAndUpdate({_id: user.id}, {$set: {voteCooldown: false, voteClaim: false}});
  }
  async function fixVote(data) {
    const user = await client.users.fetch(data._id);
    const time = user.voteCooldown.getTime() - Date.now();
    setTimeout( async () => {
      user.send('Your vote timer has refreshed, you can vote here: ' + 'https://top.gg/bot/804346878027235398/vote');
      await db.findOneAndUpdate({_id: user.id}, {$set: {voteCooldown: false, voteClaim: false}});
    }, time);
  }
};