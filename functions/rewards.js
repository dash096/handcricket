const db = require('../schemas/player.js');

module.exports = async function(winner, loser, coins) {

  const winnerData = await db.findOne({
    _id: winner.id
  });
  const loserData = await db.findOne({
    _id: loser.id
  });

  const random = Math.floor(Math.random());

  //Winner Old Data
  const winnerOldTossMulti = winnerData.tossMulti;
  const winnerOldWins = winnerData.wins;

  //Loser Old Data
  const loserOldTossMulti = loserData.tossMulti;
  const loserOldLoses = loserData.loses;

  //Set new Data
  const winnerSet = {
    $set: {
      goldMulti: random,
      tossMulti: winnerOldTossMulti - 0.069,
      wins: winnerOldWins + 1,
      status: false
    }
  };

  const loserSet = {
    $set: {
      tossMulti: loserOldTossMulti + 0.069,
      loses: loserOldLoses + 1,
      status: false
    }
  };

  //Database Update!
  await db.findOneAndUpdate( {
    _id: winner.id
  }, winnerSet);
  await db.findOneAndUpdate( {
    _id: loser.id
  }, loserSet);
};