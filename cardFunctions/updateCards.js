const db = require('../schemas/player.js')

module.exports = async (data, card, mode, remove, add = []) => {
  let { fullname } = card
  let cards = mode === 'team11' ? (data.cards?.[0]?.team || [{ team: [], slots: 10 }]) : (data.cards?.slice(1) || [])
  
  console.log(add)
  
  if (!remove && mode !== 'team11' && (cards?.[0]?.slots || 10) <= cards.slice(1).length - 1) {
    return 'err'
  }
  
  if (remove) {
    let exists = cards.find(n => n == fullname)
    if (!exists) return 'err'
    
    add = add.map(x => x.fullname)
    cards.splice(cards.indexOf(fullname), 1, ...add)
  } else {
    cards.push(fullname)
  }
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: mode === 'team11' ? {
      "cards.0.team": cards
    } : {
      cards: cards
    }
  })
}