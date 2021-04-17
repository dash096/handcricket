const Discord = require('discord.js');
const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async ({client, topggapi}) => {
  
  let embed = new Discord.MessageEmbed()
    .setTitle('Lootbox and Helmet awaiting')
    .setDescription(
      '[Vote here](https://top.gg/bot/804346878027235398/vote) to get a lootbox' +
      '\n**__Join our__** [Community](https://discord.gg/3dhtFggFXZ) **__for an instant helmet decor and 2x Coin and Slots Boost, Tourneys and for__ Update Notifs**' +
      '**Major Updates:**\n' +
      '  - Magikball powerup can be used now and maybe some noticable bugs.' + 
      '  - Tips are now shown in any random message of the bot' + 
      '  - More decors added!' +
      '  - Vote rewards changed fron 250 coins to a lootbox'
    )
    .setFooter('**You can use e.notifs to toggle dm notifications**');
    
  const datas = await db.find({ voteCooldown: { $exists: false } });
  for(const data of datas) {
    const user = await client.users.fetch(data._id);
    user.send(embed).catch(e => console.log('1 failed'));
    console.log('done')
  }*/
  
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
  
  let voteReminder = 'Your vote timer has refreshed, you can vote here: https://top.gg/bot/804346878027235398/vote, join the community server for 2x Coin Boost, A Helmet and more! Do `e.invite` for the link'
  async function joinVote(data) {
    const user = await client.users.fetch(data._id);
    user.send(voteReminder);
    await db.findOneAndUpdate( { _id: user.id }, { $set: { voteClaim: false }, $unset: { voteCooldown: false } } );
  }
  async function fixVote(data) {
    const user = await client.users.fetch(data._id);
    const time = data.voteCooldown.getTime() - Date.now();
    setTimeout( async () => {
      user.send(voteReminder);
      await db.findOneAndUpdate( { _id: user.id }, { $set: { voteClaim: false }, $unset: { voteCooldown: false } } );
    }, time);
  }
};