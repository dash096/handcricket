const db = require('../schemas/player.js')

module.exports = async (data, card, remove, add = []) => {
  let { fullname } = card
  let cards = data.cards || []
  
  if (!remove && (cards[0]?.slots || 10) <= cards.slice(1).length - 1) {
    return 'err'
  }
  
  if (remove) {
    let exists = cards.find(n => n == fullname)
    if(!exists) return 'err'
    cards.splice(cards.indexOf(fullname), 1, ...add)
  } else {
    cards.push(fullname)
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      cards: cards
    }
  })
}