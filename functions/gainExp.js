const db = require('../schemas/player.js');
const levels = require('./getLevels.js');

module.exports = async function (data, amount, msg) {
  const oldxp = data.xp;
  const add = Math.random() * amount;
  
  const pXPArray = Object.values(levels).filter(value => value < oldxp);
  const pXP = pXPArray[pXPArray.length - 1];
  const pLevel = Object.keys(levels).find(key => levels[key] === pXP);
  
  const newXP = oldxp + add;
  const sXPArray = Object.values(levels).filter(value => value < newXP);
  const sXP = sXPArray[sXPArray.length - 1];
  const sLevel = Object.keys(levels).find(key => levels[key] === sXP);
  
  console.log(pLevel, sLevel);
  
  if(pLevel != sLevel) {
    msg.channel.send(`You leveled up to ${sLevel}! Nice.`);
  }
  
  await db.findOneAndUpdate({_id: data._id},
    {
      $set: {
        xp: oldxp + add
      }
    }
  );
};