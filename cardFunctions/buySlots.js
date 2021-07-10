



const db = require('../schemas/player.js')
const updateCoins = require('../functions/updateCoins.js')

module.exports = async (data, amount) => {
  let slots = data?.cards?.[0]?.slots || 10
  let price = 0
  for (let i = 0; i < amount; i++) {
    slots += 1
    price += slots ** 2 * 10
  }
  await updateCoins(price, data)
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      "cards.$0.slots": slots
    }
  })
}