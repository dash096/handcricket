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
    let allCards = (await cardsDB.find({
      ovr: ovr < 0 ? { $lte: Math.abs(ovr) } : { $gte: ovr }
    })).filter(card => !data.cards.some(c => c._id === card._id))
    
    let starters = amount === 11 ? {
      'bat': 5, 'bowl': 3, 'ar': 2, 'wk': 1,
      'batc': [], 'bowlc': [], 'arc': [], 'wkc': [],
    } : false
    if (starters) {
      await pickStarters()
      return rewards
    }
    
    for (let i = 0; i < amount; i++) {
      let random = Math.random()
      let sliceStart = random < 0.80
                       ? 0
                       : random < 0.97
                       ? allCards.length/5
                       : random < 0.99
                       ? allCards.length/3
                       : allCcards.length/2
      let sliceEnd = random < 0.80
                     ? allCards.length - allCards.length/3
                     : random < 0.97
                     ? allCards.length - allCards.length/5
                     : allCards.length
      
      let slicedCards = allCards.slice(Math.floor(sliceStart), Math.floor(sliceEnd))
      let reward = slicedCards[Math.floor(Math.random() * slicedCards.length)]
      
      if (amount === 1) return reward
      else rewards.push(reward)
      
      allCards.splice(allCards.indexOf(reward), 1)
    }
    
    function pickStarters() {
      allCards.map(c => {
        if (c.role === 'bat') starters.batc.push(c)
        else if (c.role === 'bowl') starters.bowlc.push(c)
        else if (c.role === 'ar') starters.arc.push(c)
        else starters.wkc.push(c)
        return c
      })
      
      let { bat, bowl, ar, wk, batc, bowlc, arc, wkc } = starters
      
      for (let i = 0; i < 11; i++) {
        let reward
        if (i < bat) {
          reward = batc[Math.floor(Math.random() * batc.length)]
          batc.splice(batc.indexOf(reward), 1)
        } else if (i < bat + bowl) {
          reward = bowlc[Math.floor(Math.random() * bowlc.length)]
          bowlc.splice(bowlc.indexOf(reward), 1)
        } else if (i < bat + bowl + ar) {
          reward = arc[Math.floor(Math.random() * arc.length)]
          arc.splice(arc.indexOf(reward), 1)
        } else {
          reward = wkc[Math.floor(Math.random() * wkc.length)]
          wkc.splice(wkc.indexOf(reward), 1)
        }
        rewards.push(reward)
      }
    }
    return rewards
  }
};