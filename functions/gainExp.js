const db = require('../schemas/player.js');
const getLevels = require('./getLevels.js');
const udpateBag = require('./updateBag.js');

module.exports = async function (nabData, amt, msg, user) {
  let data = nabData;
  if(!data) data = await db.findOne({_id: msg.author.id});
  
  const levels = getLevels();
  const amount = parseInt(amt);
  const oldxp = data.xp;
  const rando = Math.random();
  const add = rando * amount;
  const newXP = oldxp + add;
  
  const pXPArray = Object.values(levels).filter(value => value < oldxp);
  const pXP = pXPArray[pXPArray.length - 1];
  const pLevel = Object.keys(levels).find(key => levels[key] === pXP);
  
  const sXPArray = Object.values(levels).filter(value => value < newXP);
  const sXP = sXPArray[sXPArray.length - 1];
  const sLevel = Object.keys(levels).find(key => levels[key] === sXP);
  
  if(pLevel != sLevel) {
    if(user) msg.send(`${user} CONGRATS!!! You leveled up to **${sLevel}**! You also got a lootbox!!!`);
    else msg.reply(`CONGRATS!!! You leveled up to **${sLevel}**! You also got a lootbox!!!`);
    await updateBag('lootbox', -1, data, message);
  }
  
  await db.findOneAndUpdate({_id: data._id},
    { $set: {
      xp: newXP
    }});
};