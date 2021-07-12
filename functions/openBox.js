const db = require("../schemas/items.js");
const getCards = require('../../cardFunctions/getCards.js')

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
  } else if (name === 'cricketbox') {
    let allCards = await getCards()
    let cards = allCards.filter(card => !data.cards?.includes(card.fullname))
    
    let sliceStart = random < 0.80
                     ? 0
                     : random < 0.95
                     ? cards.length/5
                     : random < 0.99
                     ? cards.length/3
                     : cards.length/2
    let sliceEnd = random < 0.8
                   ? cards.length - cards.length/3
                   : random < 0.95
                   ? cards.length - cards.length/5
                   : cards.length
    
    let slicedCards = cards.slice(Math.floor(sliceStart), Math.floor(sliceEnd))
    return slicedCards[Math.floor(Math.random() * slicedCards.length)]
  }
};