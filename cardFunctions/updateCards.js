const db = require('../schemas/player.js')

module.exports = async (data, card, remove) => {
  let { fullname } = card
  let cards = data.cards || {}
  
  if (
    data.cards[0].slots <= 
    data.cards.slice(1).length
  ) return 'err'
  
  if (remove) {
    cards.find(n => n == fullname)
    ? cards.splice(cards.indexOf(fullname), 1)
    : false
  } else {
    let exists = cards.find(name => name == fullname)
    if (exists) return 'err'
    else cards.push(fullname)
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      cards: cards
    }
  })
}