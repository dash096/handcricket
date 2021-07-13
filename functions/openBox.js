const db = require("../schemas/items.js");
const cardsDB = require('../schemas/card.js')






module.exports = async function (amount, data, msg, name, ovr = 1) {
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
  } else if (name === 'cricket') {
    let rewards = []
    let allCards = await cardsDB.find()
    
    for (let i = 0; i < amount; i++) {
      let cards = allCards.filter(card => { 
                    console.log(rewards.includes(card))
                    if (
                      !rewards.includes(card) &&
                      !data.cards?.includes(card.fullname) &&
                      ovr < 0
                        ? card.ovr < Math.abs(ovr)
                        : card.ovr > ovr
                    ) return true
                  })
      
      let random = Math.random()
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
      let reward = slicedCards[Math.floor(Math.random() * slicedCards.length)]
      
      if (amount === 1) return reward
      else rewards.push(reward)
    }
    
    return rewards
  }
};