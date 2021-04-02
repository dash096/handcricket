const db = require('../schemas/player.js');
const itemDb = require('../schemas/items.js');

module.exports = async function (name, amount, data, msg) {

  const oldBag = data.bag || {};
  const oldAmount = oldBag[name] || 0;
  const newAmount = oldAmount - parseInt(amount);

  if (!oldAmount || oldAmount < amount) {
    msg.reply('You dont have that many ' + name);
    return 'err';
  } 
  
  if (newAmount === 0) {
    delete oldBag[name];
  } else {
    oldBag[name] = newAmount;
  }

  await db.findOneAndUpdate({
    _id: data._id
  }, {
    $set: {
      bag: oldBag
    }
  });

};