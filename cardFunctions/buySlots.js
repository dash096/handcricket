const db = require('../schemas/player.js')
const updateCoins = require('../functions/updateCoins.js')

module.exports = async (msg, data, amount) => {
  let cards = data.cards || []
  
  let slots = cards[0] && cards[0].slots || 21
  let price = 0
  for (let i = 0; i < amount; i++) {
    slots += 1
    price += slots ** 2 * 10
  }
  
  if(data.cc < price) return 'err'
  
  await updateCoins(-(price), data)
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      "cards": [{
        team: cards.team || [],
        slots: slots,
      }, ...cards.slice(1)]
    }
  })
  return price
}