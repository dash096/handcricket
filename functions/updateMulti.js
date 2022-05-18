const db = require('../schemas/player.js');

module.exports = async function (itemName, data, msg) {
  
  
  //Change Coin Boost
  if (itemName === 'coinboost') {
    let oldCoinMulti = data.coinMulti;
    
    //Check if a boost exists
    const oldBoost = data.coinBoost;
     if(oldBoost) {
        const oldBoostTime = oldBoost.getTime();
        if(Date.now() < oldBoostTime) {
          throw 'There\'s a boost active already!';
          return
        }
      }

    //Expiry Date of Boost
    const expireDate = Date.now() + 60 * 60 * 1000;
    
    //Validate 1+ Boost
    let newCoinMulti = oldCoinMulti * 1.35;

    //Update Database
    await db.findOneAndUpdate({ _id: data._id }, {
      $set: {
        coinBoost: expireDate,
        coinMulti: newCoinMulti
      }
    }, { new: true, upsert: true }
    )
    
    //Set timeout
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            coinMulti: newCoinMulti/1.36
          }, $unset: {
            coinBoost: false
          }
        }
      );
    }, 60 * 60 * 1000);

  }




  //Change Toss Boost
  else if (itemName === 'tossboost') {
    let oldTossMulti = data.tossMulti;
    
    //Check if already its boosted
    const oldBoost = data.tossBoost;
    if(oldBoost) {
      const oldBoostTime = oldBoost.getTime();
      if(Date.now() < oldBoostTime) {
        throw 'There\'s a boost active already!'
        return
      }
    }
    
    //Const Expiry Date of Boost 
    const expireDate = Date.now() + 60 * 60 * 1000;
    
    let newTossMulti = oldTossMulti * 1.35;
    
    //Update Database
    await db.findOneAndUpdate({ _id: data._id }, {
        $set: {
          tossBoost: expireDate,
          tossMulti: newTossMulti
        }
      }, { upsert: true }
    )
    
    //Set timeout
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            tossMulti: newTossMulti/1.36
          }, $unset: {
            tossBoost: false
          }
        }
      );
    } ,  60 * 60 * 1000);
    
  }

};