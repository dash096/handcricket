const cardsDB = require('../schemas/card.js')
const cache = {}

module.exports = (fullname, uploadToCache) => {
  if(uploadToCache) cache[fullname] = uploadToCache
  
  if(cache[fullname]) {
    return cache[fullname]
  } else {
    return 'err'
  }
}