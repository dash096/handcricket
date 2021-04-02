const db = require('../schemas/player.js');
const getLevels = require('./getLevels.js');

module.exports = async function (nabdata, amount, msg) {
  const data = await db.findOne({_id: msg.author.id});
  
  const levels = getLevels();
  const oldxp = data.xp;
  const add = parseInt(Math.random() * amount);
  
  const pXPArray = Object.values(levels).filter(value => value < oldxp);
  const pXP = pXPArray[pXPArray.length - 1];
  const pLevel = Object.keys(levels).find(key => levels[key] === pXP);
  
  const newXP = oldxp + add;
  const sXPArray = Object.values(levels).filter(value => value < newXP);
  const sXP = sXPArray[sXPArray.length - 1];
  const sLevel = Object.keys(levels).find(key => levels[key] === sXP);
  
  if(pLevel != sLevel) {
    msg.reply(`CONGRATS!!! You leveled up to **${sLevel}**! You also got a lootbox!!!`);
    const bag = data.bag || {};
    const amount = bag['lootbox'] || 0;
    bag['lootbox'] = amount + 1;
    await db.findOneAndUpdate({_id: data._id},
    { $set: {
      bag: bag,
      xp: oldxp + add
    }});
  }
};