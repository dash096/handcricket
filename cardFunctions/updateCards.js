const db = require('../schemas/player.js')
const cardsDB = require('../schemas/card.js')

module.exports = async (data, card, mode, remove, add = [], swap) => {
  let cards = mode === 'team11'
              ? data.cards?.[0]?.team || []
              : data.cards?.slice(1) || []
  if (!remove && mode !== 'team11' && (cards?.[0]?.slots || 21) <= cards?.slice(1).length - 1) {
    throw "Not enough slots."
  }
  
  if (remove) {
    let exists = cards.find(c => c === card)
    if (!exists) throw `Can't find the card in your ${mode === "team11" ? "team" : "slots"}.`
    
    cards.splice(
      cards.findIndex(c => c === card),
      1,
      ...add
    )
    
    if (swap) cards.splice(swap, 1, card)
  } else {
    if (Array.isArray(card)) {
      cards.push(...card)
    } else {
      cards.push(card)
    }
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      "cards": [
        {
          team: mode === 'team11' ? cards : data.cards?.[0]?.team || [],
          slots: data.cards?.[0]?.slots || 21
        },
        ...(mode === 'team11' ? data.cards?.slice(1) || [] : cards)
      ]
    }
  })
  
  return
}