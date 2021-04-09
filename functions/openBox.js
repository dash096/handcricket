const db = require("../schemas/items.js");

module.exports = async function (amount, data, msg) {
  const random = Math.random();
  
  const toReturn = choose();
  return toReturn;
  
  function choose() {
    if(random > 0.99) {
      return 'magikball';
    }
    else if(random > 0.98) {
      return 'coinboost';
    }
    else if(random > 0.95) {
      return 'tossboost';
    }
    else if(random > 0.90) {
      return 'dots';
    }
    else if(random > 0.65) {
      return 'nuts';
    }
    else if(random > 0.45) {
      return 'redbull';
    }
    else if(random < 0.05) {
      return 'decor';
    }
    else {
      const rando = Math.random() * 696;
      const coins = rando.toFixed(0);
      return coins;
    }
  }
};