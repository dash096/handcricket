const db = require("../schemas/items.js");

module.exports = async function (name, amount, data, msg) {
  const random = Math.random();
  
  const docs = await db.find({}, ['name', 'rarity'])
  .sort({
    rarity: -1
  });
  console.log(docs);
  
  if(random > 0.99) {
    return 'magikball';
  }
  else if(random > 0.93) {
    return 'coinboost';
  }
  else if(random > 0.86) {
    return 'tossboost';
  }
  else if(random > 0.75) {
    return 'dots';
  }
  else if(random > 0.55) {
    return 'nuts';
  }
  else if(random > 0.40) {
    return 'redbull';
  }
  else {
    const rando = Math.random() * 696;
    const coins = rando.toFixed(0);
    return coins;
  }
};