const db = require("../schemas/items.js");

module.exports = async function (amount, data, msg, name) {
  if (name === 'loot') {
    const random = Math.random();
    
    const itemsData = await db.find({
      name: {
        $ne: 'lootbox'
      }
    });
    
    const items = [];
    
    itemsData.forEach(data => {
      items.push(data.name);
    });
    
    items.push('decor');
    items.push(259);
    
    const toReturn = choose();
    return toReturn;
    
    function choose() {
      const reward = items[Math.floor(Math.random() * items.length)];
      if(reward === 'decor') {
        const rando = Math.random();
        if(rando < 0.2) {
          return reward;
        }
        return 250;
     }
      return reward;
    }
  }
};