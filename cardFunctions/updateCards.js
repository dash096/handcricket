const db = require('../schemas/player.js')

module.exports = async (data, card, remove, msg) => {
  let { fullname } = card
  let cards = data.cards || {}
  
  if (
    !remove &&
    data.cards[0].slots || 10 <= 
    data.cards.slice(1).length - 1
  ) return 'err'
  
  if (remove) {
    let exists = cards.find(n => n == fullname)
    msg.reply(JSON.stringify(card) + remove)
    if(!exists) return 'err'
    
    exists
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