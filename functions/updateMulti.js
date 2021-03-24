const db = require('../schemas/player.js');

module.exports = async function (name, data, msg) {


//Change Coin Boost
  if (name === 'coinboost') {
    const oldBag = data.bag || {};
    const oldAmount = oldBag[name];
    const oldCoinMulti = data.coinMulti;

    //Check No. of Items is bigger than usage
    if (!oldAmount || oldAmount === 0) {
      return msg.reply('You dont have a ' + name + ' in your bag. Buy one!');
    }
    
    //Check if a boost exists
    const oldBoost = data.coinBoost;
    const oldBoostTime = oldBoost.getTime();
    if(Date.now() < oldBoostTime) {
      return msg.reply('There\'s a boost active already!');
    }

    //Const Expiry Date of Boost
    const expireDate = Date.now() + 60 * 1000;
    console.log(Date.now(), expireDate);

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

  }


//Change Toss Boost
  if (name === 'tossboost') {
    const oldBag = data.bag || {};
    const oldAmount = oldBag[name];
    const oldTossMulti = data.tossMulti;

    //Check if usage is smaller than balance
    if (!oldAmount || oldAmount === 0) {
      return msg.reply('You dont have a ' + name + ' in your bag. Buy one!');
    }
    
    //Check if already its boosted
    const oldBoost = data.tossBoost;
    const oldBoostTime = oldBoost.getTime();
    if(Date.now() < oldBoostTime) {
      return msg.reply('There\'s a boost active already!');
    }
    
    //Const Expiry Date of Boost 
    const expireDate = Date.now() + 60 * 1000;
    console.log(Date.now(), expireDate);

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
  }

};