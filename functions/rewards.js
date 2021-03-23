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
  const winnerGoldMulti = winnerData.goldMulti;
  const winnerTossMulti = winnerData.tossMulti;
  const winnerWins = winnerData.wins;
  const winnerCoins = winnerData.cc;

  //Loser Old Data
  const loserTossMulti = loserData.tossMulti;
  const loserLoses = loserData.loses;

  //Set new Data
  const winnerSet = {
    $set: {
      cc: winnerCoins + coins,
      goldMulti: winnerGoldMulti + random,
      tossMulti: winnerTossMulti - 0.069,
      wins: winnerWins + 1,
      status: false
    }
  }

  const loserSet = {
    $set: {
      tossMulti: loserTossMulti + 0.069,
      loses: loserLoses + 1,
      status: false
    }
  }

  //Database Update!
  await db.findOneAndUpdate( {
    _id: winner.id
  }, winnerSet);
  await db.findOneAndUpdate( {
    _id: loser.id
  }, loserSet);
};