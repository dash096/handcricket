const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async ({client, topggapi}) => {
  
  const greaterCooldown = await db.find({ voteCooldown: { $gte: Date.now() } });
  const lesserCooldown = await db.find({ voteCooldown: { $lte: Date.now() } });
  
  if(greaterCooldown.length === 0) {
    console.log('0 toFixVotes found');
  } else {
    console.log(greaterCooldown.length + ' toFixVotes found');
    for(const data of greaterCooldown) {
      fixVote(data);
    }
  }
  if(lesserCooldown.length === 0) {
    console.log('0 brokeVotes found');
  } else {
    console.log(lesserCooldown.length + ' brokeVotes found');
    for(const data of lesserCooldown) {
      joinVote(data);
    }
  }
  
  async function joinVote(data) {
    const user = await client.users.fetch(data._id);
    user.send('Your vote timer has refreshed, you can vote here: ' + 'https://top.gg/bot/804346878027235398/vote');
    await db.findOneAndUpdate( { _id: user.id }, { $set: { voteClaim: false }, $unset: { voteCooldown: false } } );
  }
  async function fixVote(data) {
    const user = await client.users.fetch(data._id);
    const time = data.voteCooldown.getTime() - Date.now();
    setTimeout( async () => {
      user.send('Your vote timer has refreshed, you can vote here: ' + 'https://top.gg/bot/804346878027235398/vote');
      await db.findOneAndUpdate( { _id: user.id }, { $set: { voteClaim: false }, $unset: { voteCooldown: false } } );
    }, time);
  }
};