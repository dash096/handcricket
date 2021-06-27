const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');

module.exports = async function(winner, loser, coins, wS, wB, lS, lB, message) {
  const { channel } = message;
  
  const winnerData = await db.findOne({
    _id: winner.id
  });
  const loserData = await db.findOne({
    _id: loser.id
  });

  const random = Math.random();
  const randoXP = Math.random() * 6.9;

  //Winner Data
  const winnerCoinMulti = winnerData.coinMulti;
  const winnerWins = winnerData.wins;
  const winnerCoins = winnerData.cc;
  const winnerSTR = winnerData.strikeRate;
  const winnerXP = winnerData.xp;
  
  const wSTR = (winnerSTR + (wS/lB))/2;
  
  let winnerHighScore = winnerData.highScore || 0;
  let winnerTotalScore = ((winnerData.totalScore || 0) + parseInt(wS));
  if (wS > winnerHighScore) {
    winnerHighScore = wS;
  }
  
  //Loser Data
  const loserLoses = loserData.loses;
  const loserSTR = loserData.strikeRate;
  const loserXP = loserData.xp;
  const lSTR = (loserSTR + (lS/wB))/2;
  
  let loserHighScore = loserData.highScore || 0;
  let loserTotalScore = ((loserData.totalScore || 0) + parseInt(lS));
  if (lS > loserHighScore) {
    loserHighScore = lS;
  }
  
  //Set new Data
  const winnerSet = {
    $set: {
      cc: parseInt(winnerCoins) + parseInt(coins),
      coinMulti: (parseFloat(winnerCoinMulti) + 0.0069),
      wins: winnerWins + 1,
      strikeRate: wSTR,
      highScore: winnerHighScore,
      totalScore: winnerTotalScore,
      status: false
    }
  };

  const loserSet = {
    $set: {
      loses: loserLoses + 1,
      strikeRate: lSTR,
      highScore: loserHighScore,
      totalScore: loserTotalScore,
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
  
  await gain(winnerData, 7, message, winner);
  await gain(loserData, 6, message, loser);
};