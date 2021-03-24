const db = require('../schemas/player.js');

module.exports = async function (name, data, msg) {

  if (name === 'coinboost') {
    const oldBag = data.bag || {};
    const oldAmount = oldBag[name];
    const oldCoinMulti = data.coinMulti;

    if (!oldAmount || oldAmount === 0) {
      return msg.reply('You dont have a ' + name + ' in your bag. Buy one!');
    }

    const expireDate = Date.now() + 60 * 1000;
    console.log(Date.now(), expireDate);

    await db.findOneAndUpdate(
      {
        _id: data._id
      }, {
        $set: {
          coinBoost: expireDate,
          coinMulti: oldCoinMulti * 2
        }
      }, {
        upsert: true
      }).catch((e) => {
        console.log(e);
      });

  }

};