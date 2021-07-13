




const cardsDB = require('../schemas/card.js')
let db_cache

module.exports = async () => {
  if (db_cache) db_cache = await cardsDB.find()
  return db_cache
}