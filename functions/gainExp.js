const db = require('../schemas/player.js');
const getLevels = require('./getLevels.js');
const updateBag = require('./updateBag.js');

module.exports = async (data, amt, msg, user) => {
  if(!data) {
    if(user && user.id) data = await db.findOne({_id: user.id});
    else data = await db.findOne({_id: msg.author.id});
  } else {
    data = await db.findOne({_id: msg.author.id});
  }
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
    let text = '';
    if(user) text += `${user}, CONGRATS!!! You leveled up to **${sLevel}**! You also got a lootbox!!!`;
    else text += `CONGRATS!!! You leveled up to **${sLevel}**! You also got a lootbox!!!`;
    await updateBag('lootbox', -1, data, msg);
    if(!user) await msg.reply(text);
    else msg.channel.send(text);
    await db.findOneAndUpdate({_id: data._id}, {$set: {xp: sXP + 1}});
    return;
  }
  
  await db.findOneAndUpdate({_id: data._id},
    { $set: {
      xp: newXP
    }});
};