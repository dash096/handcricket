const db = require('../schemas/player.js');

module.exports = async function (name, data, msg) {


//Change Coin Boost
  if (name === 'coinboost') {
    const oldBag = data.bag || {};
    const oldAmount = oldBag[name];
    let oldCoinMulti = data.coinMulti;

    //Check No. of Items is bigger than usage
    if (!oldAmount || oldAmount === 0) {
      msg.reply('You dont have a ' + name + ' in your bag. Buy one!');
      return 'err';
    }
    
    //Check if boost is 0, and change to 0.1
    if (oldCoinMulti === 0) {
      oldCoinMulti = 0.1;
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

    //Update Database
    await db.findOneAndUpdate({ _id: data._id }, {
      $set: {
        coinBoost: expireDate,
        coinMulti: oldCoinMulti * 2
      }
    }, { upsert: true }
    ).catch((e) => {
        console.log(e);
    });
    
    //Set timeout
    setTimeout( async function () {
      oldCoinMulti = data.coinMulti;
      let newCoinMulti;
      if(oldCoinMulti === 0.2) {
        newCoinMulti = 0;
      } else {
        newCoinMulti = oldCoinMulti/2;
      }
      await db.findOneAndUpdate( {_id: data._id},
        { $set: { 
              coinMulti: newCoinMulti,
              coinBoost: undefined,
          }
        }
      );
    }, 60 * 1000);

  }




//Change Toss Boost
  if (name === 'tossboost') {
    const oldBag = data.bag || {};
    const oldAmount = oldBag[name];
    let oldTossMulti = data.tossMulti;

    //Check if usage is smaller than balance
    if (!oldAmount || oldAmount === 0) {
      msg.reply('You dont have a ' + name + ' in your bag. Buy one!');
      return 'err';
    }
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
            tossMulti: newTossMulti,
            tossBoost: undefined,
          }
        }
      );
    } ,  60 * 1000);
    
  }

};