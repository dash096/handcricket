const db = require('../schemas/player.js');
const gain = require('../functions/gainExp.js');
const getEmoji = require('../functions/getEmoji.js')

module.exports = async function(winner, loser, coins, winnerLogs, loserLogs, message, challenge) {
  try {
    const { channel } = message;
    
    if (challenge) {
      if(challenge.update === false) {
        if(winner.id !== 'CPU') {
          await db.findOneAndUpdate({ _id: winner.id }, {
            $inc: {
              cc: parseInt(coins),
            }
          })
          return
        }
      }
      else {
        if (winner.id === 'CPU') return await loser.send('You lost the challenge')
        else await winner.send(`You won the challenge and earned a ${await getEmoji('lootbox')} lootbox!`)
      }
      
      let data = await db.findOne({ _id: winner.id })
      let bag = data.bag || {}
      bag.lootbox = (bag.lootbox || 0) + 1
      
      let beforeProgress = challenge.name.split('_')
      let currentProgress
      if (challenge.update === false) currentProgress = beforeProgress
      else currentProgress = [beforeProgress[0], beforeProgress[1] + 1].join('_')

      let pattern = await changePattern(data, winnerLogs.batArray)
      
      await db.findOneAndUpdate({ _id: data.id }, {
        $set: {
          bag: bag,
          challengeProgress: currentProgress,
          pattern: pattern,
        }
      })
      
      return
    }
    
    const wS = winnerLogs.batArray.slice(-1)[0]
    const lB = winnerLogs.ballArray.length
    const lS = loserLogs.batArray.slice(-1)[0]
    const wB = loserLogs.ballArray.length
    
    const winnerData = await db.findOne({
      _id: winner.id
    });
    const loserData = await db.findOne({
      _id: loser.id
    });
    
    const winnerPattern = await changePattern(winnerData, winnerLogs.batArray)
    const loserPattern = await changePattern(loserData, loserLogs.batArray)
  
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
        status: false,
        pattern: winnerPattern,
      }
    };

    const loserSet = {
      $set: {
        loses: loserLoses + 1,
        strikeRate: lSTR,
        highScore: loserHighScore,
        totalScore: loserTotalScore,
        status: false,
        pattern: loserPattern,
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
  } catch (e) {
    console.log(e)
  }
}

function changePattern(data, scores) {
  let pattern = data.pattern || {}
  
  logs = []
  for (let i = 0; i < scores.length; i++) {
    if (i !== 0) logs.push(scores[i] - scores[i-1])
  }
  
  for (let i = 0; i < logs.length; i++) {
    num = logs[i]
    pattern[num] = (pattern[num] || 0) + 1
  }
  
  console.log(pattern)
  return pattern
}