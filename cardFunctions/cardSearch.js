const cardsDB = require('../schemas/card.js')

module.exports = async (args) => {
  let query = args.join('').toLowerCase()
  
  let cards = await cardsDB.find({
    fullname: { $regex: `(^${query[0]}|_${query[0]}|${query})` }
  })
  
  let card = cards.find(x => {
    if (
      query === x.name.split('-').join('') ||
      query === x.fullname.split('_').join('') ||
      x.fullname.split('_').join('').includes(query)
    ) return true
    
    let name = x.fullname.split('_')
    if(name[0][0] === query[0]) name = name[0]
    else name = name[1]
    
    let counter = 0
    for (let i = 0; i < query.length; i++) {
      if (name.includes(query[i])) counter += 1
    }
    
    if (counter > 5 && counter >= query.length) return true
    else return false
  })
  return card
}