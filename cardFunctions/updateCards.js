const db = require('../schemas/player.js')

module.exports = async (data, card, mode, remove, add = []) => {
  let { fullname } = card
  let cards = mode === 'team11'
              ? data.cards?.[0]?.team || []
              : data.cards?.slice(1) || []
  console.log(cards, data.cards)
  if (!remove && mode !== 'team11' && (cards?.[0]?.slots || 10) <= cards.slice(1).length - 1) {
    return 'err'
  }
  
  if (remove) {
    let exists = cards.find(n => n == fullname)
    if (!exists) return 'err'
    
    add = add.map(x => x.fullname)
    cards.splice(cards.indexOf(fullname), 1, ...add)
  } else {
    cards.push(fullname)
  }
  
  Promise.all(
    [await db.findOneAndUpdate({ _id: data._id, cards: { $exists: true } }, {
      $set: (mode === 'team11' 
          ? {
            "cards.$": {
              team: cards,
              slots: data.cards?.[0]?.slots || 10
            }
          }
          : {
            "cards": [
              {
                team: data.cards[0].team || [],
                slots: data.cards[0].slots || 10,
              },
              ...cards,
            ]
          })
    })
  ])
  
  return
}