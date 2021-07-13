const db = require('../schemas/player.js')

module.exports = async (data, card, mode, remove, add = []) => {
  let { fullname } = card
  let cards = mode === 'team11'
              ? data.cards?.[0]?.team || []
              : data.cards?.slice(1) || []
  if (!remove && mode !== 'team11' && (cards?.[0]?.slots || 10) <= cards.slice(1).length - 1) {
    return 'err'
  }
  
  if (remove) {
    let exists = cards.find(n => n == fullname)
    if (!exists) return 'err'
    
    add = add.map(x => x.fullname)
    cards.splice(cards.indexOf(fullname), 1, ...add)
  } else {
    if (Array.isArray(card)) {
      card = card.map(x => x.fullname || x)
      cards.push(...card)
    } else {
      cards.push(fullname)
    }
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      "cards": [
        {
          team: mode === 'team11' ? cards : data.cards?.[0]?.team || [],
          slots: data.cards?.[0]?.slots || 10
        },
        ...(mode === 'team11' ? data.cards?.slice(1) || [] : cards)
      ]
    }
  })
  
  return
}