const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');
const getEmoji = require('../functions/getEmoji.js');

module.exports = async function(winner, loser, channel) {
  const coinEmoji = await getEmoji('coin');
  
  const winnerData = await db.findOne({
    _id: winner.id
  });
  const loserData = await db.findOne({
    _id: loser.id
  });
  
  const randoCoins = parseInt(Math.random() * (winnerData.coinMulti || 0.2) * 345);
  winner.send(`You looted a grand amount of ${coinEmoji} ${randoCoins}`);
  
  //Winner Old Data
  const winnerCoinMulti = winnerData.coinMulti;
  const winnerCoins = winnerData.cc;
  
  //Loser Old Data
  const loserTossMulti = loserData.tossMulti;
  
  //Set new Data
  const winnerSet = {
    $set: {
      cc: parseInt(winnerCoins) + parseInt(randoCoins),
      coinMulti: (parseFloat(winnerCoinMulti) + 0.0069),
      status: false,
    }
  };

  const loserSet = {
    $set: {
      tossMulti: (parseFloat(loserTossMulti) + 0.0069),
      status: false,
    }
  };

  //Database Update!
  await db.findOneAndUpdate( {
    _id: winner.id
  }, winnerSet);
  await db.findOneAndUpdate( {
    _id: loser.id
  }, loserSet);
  
  await gain(winnerData, 7, message, winner);
  await gain(loserData, 6, message, loser);
};