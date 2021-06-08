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

  //Winner Old Data
  const winnerCoinMulti = winnerData.coinMulti;
  const winnerWins = winnerData.wins;
  const winnerCoins = winnerData.cc;
  const winnerSTR = winnerData.strikeRate;
  const winnerXP = winnerData.xp;
  const winnerQuests = winnerData.quests || {};
  //Duck?
  const winnerDuck = winnerQuests.duck || 0;
  if(winnerDuck !== true && wB == 2) {
    winnerQuests.duck = true;
  }
  //TripWin?
  let winnerTripArray = winnerQuests.tripWin || [];
  let winnerTrip = winnerTripArray[0] || 0;
  let lastWinnerDueller = winnerTripArray[1] || 12345678910111;
  if(winnerTrip != true && lastWinnerDueller != loser.id) {
    let newWinnerTrip = parseInt(winnerTrip) + 1;
    if(newWinnerTrip === 3) {
      newWinnerTrip = true;
      winnerQuests.tripWin = [true, loser.id];
    } else {
      winnerQuests.tripWin = [newWinnerTrip, loser.id];
    }
  }
  
  //Loser Old Data
  const loserLoses = loserData.loses;
  const loserSTR = loserData.strikeRate;
  const loserXP = loserData.xp;
  const loserQuests = loserData.quests || {};
  //Duck?
  const loserDuck = loserQuests.duck || 0;
  if(loserDuck !== true && lB == 2) {
    loserQuests.duck = true;
  }
  //TripWin?
  delete loserQuests.tripWin;
  loserQuests.tripWin = [];
  (loserQuests.tripWin).push(0);
  
  const wSTR = (winnerSTR + (wS/lB))/2;
  const lSTR = (loserSTR + (lS/wB))/2;
  
  let winnerHighScore = winnerData.highScore || 0;
  let winnerTotalScore = ((winnerData.totalScore || 0) + parseInt(wS));
  if (wS > winnerHighScore) {
    winnerHighScore = wS;
  }
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
      quests: winnerQuests,
      highScore: winnerHighScore,
      totalScore: winnerTotalScore,
      status: false
    }
  };

  const loserSet = {
    $set: {
      loses: loserLoses + 1,
      strikeRate: lSTR,
      quests: loserQuests,
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