const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');

module.exports = async function(winner, loser, coins, wS, wB, lS, lB) {

  const winnerData = await db.findOne({
    _id: winner.id
  });
  const loserData = await db.findOne({
    _id: loser.id
  });

  const random = Math.random();

  //Winner Old Data
  const winnerCoinMulti = winnerData.coinMulti;
  const winnerTossMulti = winnerData.tossMulti;
  const winnerWins = winnerData.wins;
  const winnerCoins = winnerData.cc;
  const winnerSTR = winnerData.strikeRate;
  
  //Loser Old Data
  const loserTossMulti = loserData.tossMulti;
  const loserLoses = loserData.loses;
  const loserSTR = loserData.strikeRate;
  
  const wSTR = (winnerSTR + (wS/wB))/2;
  const lSTR = (loserSTR + (lS/lB))/2;
  
  //Set new Data
  const winnerSet = {
    $set: {
      cc: parseInt(winnerCoins) + parseInt(coins),
      goldMulti: winnerCoinMulti + random.toFixed(3),
      tossMulti: winnerTossMulti - 0.069,
      wins: winnerWins + 1,
      strikeRate: wSTR,
      status: false
    }
  };

  const loserSet = {
    $set: {
      tossMulti: loserTossMulti + 0.069,
      loses: loserLoses + 1,
      strikeRate: lSTR,
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
  
  await gain(winnerData, 10);
  await gain(loserData, 10);
};