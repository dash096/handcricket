const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');

module.exports = async function(winner, loser, coins, wS, wB, lS, lB, channel) {

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
  const winnerTossMulti = winnerData.tossMulti;
  const winnerWins = winnerData.wins;
  const winnerCoins = winnerData.cc;
  const winnerSTR = winnerData.strikeRate;
  const winnerXP = winnerData.xp;
  const winnerQuests = winnerData.quests;
  //Duck?
  const winnerDuck = winnerQuests.duck || 0;
  if(winnerQuests != true && wB.length == 2) {
    winnerQuests.duck = true;
  }
  console.log(wB, lB);
  //TripWin?
  let winnerTrip = (winnerQuests.tripWin)[0];
  let lastWinnerDueller = (winnerQuests.tripWin)[1];
  if(!winnerTrip) winnerTrip = 0;
  if(winnerTrip != true && lastWinnerDueller != loser.id) {
    let newWinnerTrip = winnerTrip + 1;
    if(newWinnerTrip === 3) {
      newWinnerTrip = true;
      winnerQuests.tripWin = [true, loser.id];
    } else {
      winnerQuests.tripWin = [newWinnerTrip, loser.id];
    }
  }
  
  //Loser Old Data
  const loserTossMulti = loserData.tossMulti;
  const loserLoses = loserData.loses;
  const loserSTR = loserData.strikeRate;
  const loserXP = loserData.xp;
  const loserQuests = loserData.quests;
  //Duck?
  const loserDuck = loserQuests.duck || 0;
  if(loserQuests != true && lB.length == 2) {
    loserQuests.duck = true;
  }
  //TripWin?
  let loserTrip = loserQuests.tripWin;
  if(!loserTrip) loserTrip = 0;
  delete loserQuests.tripWin;
  
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
      xp: winnerXP + randoXP,
      quests: winnerQuests,
      status: false
    }
  };

  const loserSet = {
    $set: {
      tossMulti: loserTossMulti + 0.069,
      loses: loserLoses + 1,
      strikeRate: lSTR,
      xp: loserXP + randoXP,
      quests: loserQuests,
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
  
  await gain(winnerData, 7, mc);
  await gain(loserData, 6, mc);
};