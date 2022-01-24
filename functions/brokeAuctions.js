const auctionsDB = require('../schemas/auction.js')
const db = require('../schemas/player.js')
const updateCard = require('../cardFunctions/updateCards.js')
const updateCoins = require('./updateCoins.js')
const getEmoji = require('./getEmoji.js')

module.exports = async ({ client }) => {
  const coinsEmoji = await getEmoji('coin')
  const brokeDatas = await auctionsDB.find()
  
  for (let i in brokeDatas) {
    const auctionData = brokeDatas[i]
    const remainingTime = Date.now() - auctionData.end.getTime()
    
    setTimeout(async function timeout() {
      const owner = await client.users.fetch(auctionData.owner)
      const ownerData = await db.findOne({ _id: owner.id })
      const winner = await client.users.fetch(auctionData.currentBidder)
      const winnerData = await db.findOne({ _id: winner.id })
      const card = auctionData.card

      await updateCard(winnerData, card, 'slots')
      if (auctionData.currentBidder !== auctionData.owner) {
        await updateCoins(auctionData.currentBid, ownerData)
        await owner.send(`Your auction for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\` has ended, and you recieved ${coinsEmoji} \`${auctionData.currentBid}\``)
      }
      await winner.send(`You won the auction for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\``)
      await auctionsDB.deleteOne({ _id: auctionData._id })
    }, remainingTime > 0 ? 5 * 1000 : remainingTime)
  }
}