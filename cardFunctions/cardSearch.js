const cardsDB = require('../schemas/card.js')

module.exports = async (args) => {
  let query = args.join('').toLowerCase()
  
  let cards = await cardsDB.find({
    fullname: { $regex: `(^${query[0]}|_${query[0]}|${query})` }
  })
  
  let got100 = false
  let results = cards.map(x => {
    if (got100) return [0, x];
    
    if (
      query === x.name.split('-').join('') ||
      query === x.fullname.split('_').join('') ||
      x.fullname.split('_').join('').includes(query)
    ) {
      got100 = true
      return [100, x]
    }
    
    let name = x.fullname.split('_')
    if(name[0][0] === query[0]) name = name[0]
    else name = name[1]
    
    let counter = 0
    for (let i = 0; i < query.length; i++) {
      if (name.includes(query[i])) counter += 1
    }
    
    return [counter, x]
  })
  
  return results.find(x => x[0] === Math.max(
      ...Object.keys(
        Object.fromEntries(results)
      )
    )
  )[1]
}