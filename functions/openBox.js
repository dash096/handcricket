const db = require("../schemas/items.js");

module.exports = async function (amount, data, msg) {
  const random = Math.random();
  
  const itemsData = await db.find();
  const items = [];
  const getItemNames = () => {
    itemsData.forEach(data => {
      if(data != 'lootbox') {
        items.push(data.name);
      }
    });
  };
  getItemNames();
  items.push('decor');
  items.push(259);
  const toReturn = choose();
  return toReturn;
  
  function choose() {
    const reward = items[Math.floor(Math.random() * items.length)];
    if(reward === 'decor') {
      const rando = Math.random();
      if(rando > 0.5) {
        return reward;
      }
      return 696;
    }
    return reward;
  }
};