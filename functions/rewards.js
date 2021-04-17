const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');
const getDecors = require('./getDecors.js');
const updateDecor = require('./updateDecor.js');

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
  const loserTossMulti = loserData.tossMulti;
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
  
  const rando = Math.random();
  if(rando < 0.05) {
    const decors = getDecors('type1');
    const decor = decors[Math.floor(Math.random() * decors.length)];
    updateDecor(decor, 1, winnerData);
    winner.send(`Oh Damm! You got a ${decor} too!`);
  }
  await gain(winnerData, 7, channel, winner);
  await gain(loserData, 6, channel, loser);
};