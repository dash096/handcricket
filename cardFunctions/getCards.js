const cardsDB = require('../schemas/card.js')

module.exports = async () => {
  return await cardsDB.find().sort({ ovr: 1 })
}