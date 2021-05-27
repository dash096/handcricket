const db = require('../schemas/player.js');

module.exports = async function (itemName, data, msg) {
  
  
  //Change Coin Boost
  if (itemName === 'coinboost') {
    let oldCoinMulti = data.coinMulti || 0;
    
    //Check if boost is 0, and change to 0.05
    if (oldCoinMulti === 0) {
      oldCoinMulti = 0.05;
    }
    
    //Check if a boost exists
    const oldBoost = data.coinBoost;
     if(oldBoost) {
        const oldBoostTime = oldBoost.getTime();
        if(Date.now() < oldBoostTime) {
          msg.reply('There\'s a boost active already!');
          return 'err';
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
    ).catch((e) => {
      console.log(e);
    });
    
    //Set timeout
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            coinMulti: newCoinMulti/1.36
          }, $unset: {
            coinBoost: 'no Matter'
          }
        }
      );
    }, 60 * 60 * 1000);

  }




  //Change Toss Boost
  else if (itemName === 'tossboost') {
    let oldTossMulti = data.tossMulti;
    
    //Check if tossmulti is 0 and change to 0.1
    if(oldTossMulti === 0) {
      oldTossMulti = 0.1;
    }
    
    //Check if already its boosted
    const oldBoost = data.tossBoost;
    if(oldBoost) {
      const oldBoostTime = oldBoost.getTime();
      if(Date.now() < oldBoostTime) {
        msg.reply('There\'s a boost active already!');
        return 'err';
      }
    }
    
    //Const Expiry Date of Boost 
    const expireDate = Date.now() + 60 * 60 * 1000;
    
    let newTossMulti = oldTossMulti * 1.35;
    if(newTossMulti > 0.9) {
      newTossMulti = 0.9;
    }
    
    //Update Database
    await db.findOneAndUpdate({ _id: data._id }, {
        $set: {
          tossBoost: expireDate,
          tossMulti: newTossMulti
        }
      }, { upsert: true }
    ).catch((e) => {
      console.log(e);
    });
    
    //Set timeout
    setTimeout( async function () {
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            tossMulti: newTossMulti/1.36
          }, $unset: {
            tossBoost: 'doesnt matter'
          }
        }
      );
    } ,  60 * 60 * 1000);
    
  }

};