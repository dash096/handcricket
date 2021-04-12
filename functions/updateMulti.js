const db = require('../schemas/player.js');

module.exports = async function (name, data, msg) {
  //Change Coin Boost
  if (name === 'coinboost') {
    let oldCoinMulti = data.coinMulti || 0;
    
    //Check if boost is 0, and change to 0.1
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
    const expireDate = Date.now() + 60 * 1000;
    
    //Validate 1+ Boost
    let newCoinMulti = oldCoinMulti * 2;

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
      oldCoinMulti = data.coinMulti;
      let newCoinMulti;
      if(oldCoinMulti === 0.1) {
        newCoinMulti = 0.2;
      } else {
        newCoinMulti = oldCoinMulti/2;
      }
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            coinMulti: newCoinMulti
          }, $unset: {
            coinBoost: 'no Matter'
          }
        }
      );
    }, 60 * 1000);

  }




//Change Toss Boost
  if (name === 'tossboost') {
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
    const expireDate = Date.now() + 60 * 1000;
    
    let newTossMulti = oldTossMulti * 1.4;
    if(newTossMulti > 0.9) {
      newTossMulti = 0.9;
    }
    //Update Database
    await db.findOneAndUpdate({ _id: data._id }, {
        $set: {
          tossBoost: expireDate,
          tossMulti: oldTossMulti * 1.4
        }
      }, { upsert: true }
    ).catch((e) => {
          console.log(e);
    });
    
    //Set timeout
    setTimeout( async function () {
      oldTossMulti = data.oldTossMulti;
      let newTossMulti;
      if(oldTossMulti === 0.2) {
        newTossMulti = 0;
      } else {
        newTossMulti = oldTossMulti/2;
      }
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
            tossMulti: newTossMulti
          }, $unset: {
            tossBoost: ''
          }
        }
      );
    } ,  60 * 1000);
    
  }

};