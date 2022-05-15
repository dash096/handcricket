const db = require('../schemas/player.js');

module.exports = async function (what, boost) {

  if(what === 'toss') {
    let oldTossMulti = boost.tossMulti;
    
    let time = boost.tossBoost.getTime() - Date.now();
    if(time < 0) time = 10;
    
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: boost._id},
        { 
          $set: { 
            tossMulti: oldTossMulti/1.36
          },
          $unset: {
            tossBoost: false
          }
        }
      );
    }, time);
  }
  
  if(what === 'coin') {
    let oldCoinMulti = boost.coinMulti;
    
    let time = boost.coinBoost.getTime() - Date.now();
    if(time < 0) time = 1;
    
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: boost._id},
        { $set: { 
            coinMulti: oldCoinMulti/1.36
          },
          $unset: {
            coinBoost: false
          }
        }
      );
    }, time);
  }
  
};