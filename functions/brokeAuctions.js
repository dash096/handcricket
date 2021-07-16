





const auctionsDB = require('../schemas/auction.js')
const db = require('../schemas/player.js')

module.exports = async ({ client }) => {
  const brokeDatas = await auctionsDB.find({ end: { $exists: true } })
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
      if (auctionData.currentBidder !== auctionData.owner) await updateCoins(auctionData.currentBid, ownerData)
      await winner.send(`You won the auction for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\``)
      await auctionsDB.deleteOne({ _id: auctionData._id })
    }, remainingTime > 0 ? 5 * 1000 : remainingTime)
  }
}