const db = require('../schemas/player.js');

module.exports = async function (what, boost) {

  if(what === 'toss') {
    let oldTossMulti = boost.tossMulti;
    if(oldTossMulti === 0.2) {
      oldTossMulti = 0;
    }
    let time;
    if(boost.tossBoost) {
      time = boost.tossBoost.getTime() - Date.now();
    }
    if(time < 0) time = 10;
      
    setTimeout( async function clearBoost() {
      await db.findOneAndUpdate( {_id: boost._id},
        { $set: { 
            tossMulti: oldTossMulti/1.4
          },
          $unset: {
            tossBoost: 'No matter'
          }
        }
      );
    }, time);
  }
  
  if(what === 'coin') {
    let oldCoinMulti = boost.coinMulti;
    
    if(oldCoinMulti === 0.1) {
      oldCoinMulti = 0.2;
    }
    let time;
    if(boost.coinBoost) {
      time = boost.coinBoost.getTime() - Date.now();
    }
    if(time < 0) time = 1;
    console.log(time/1000);
      
    setTimeout( async function clearBoost() {
      await db.findOneAndUpdate( {_id: boost._id},
        { $set: { 
            coinMulti: oldCoinMulti/2
          },
          $unset: {
            coinBoost: 'no matter'
          }
        }
      );
    }, time);
  }
  
};