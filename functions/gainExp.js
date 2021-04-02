const db = require('../schemas/player.js');

module.exports = async function (a, amount, msg) {
  const oldxp = a.xp;
  const add = Math.random() * amount;
  const levels = require('./getLevels.js');
  
  const xp = a.xp;
  const pXPArray = Object.values(levels).filter(value => value < xp);
  const pXP = pXPArray[pXPArray.length - 1];
  const pLevel = Object.keys(levels).find(key => levels[key] === pXP);
  
  const newXP = oldxp + add;
  const sXPArray = Object.values(levels).filter(value => value < newXP);
  const sXP = sXPArray[sXPArray.length - 1];
  const sLevel = Object.keys(levels).find(key => levels[key] === sXP);
  
  if(pLevel != sLevel) {
    msg.channel.send(`You leveled up to ${sLevel}! Nice.`);
  }
  
  await db.findOneAndUpdate({_id: a._id},
    {
      $set: {
        xp: oldxp + add
      }
    }
  );
};