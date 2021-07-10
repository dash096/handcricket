const db = require('../schemas/player.js')

module.exports = async (data, card, remove) => {
  let { fullname } = card
  let cards = data.cards || {}
  
  if (
    !remove &&
    data.cards[0].slots || 10 <= 
    data.cards.slice(1).length - 1
  ) return 'err'
  
  if (remove) {
    cards.find(n => n == fullname)
    ? cards.splice(cards.indexOf(fullname), 1)
    : false
  } else {
    cards.push(fullname)
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      cards: cards
    }
  })
}