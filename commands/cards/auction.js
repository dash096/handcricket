const db = require('../../schemas/player.js')
const Discord = require('discord.js')
const embedColor = require('../../functions/getEmbedColor.js')
const gain = require('../../functions/gainExp.js')
const cardsDB = require('../../schemas/card.js')
const getCardImage = require('../../cardFunctions/getImage.js')
const cardSearch = require('../../cardFunctions/cardSearch.js')
const getError = require('../../functions/getErrors.js')
const ms = require('ms')
const auctionsDB = require('../../schemas/auction.js')
const getEmoji = require('../../functions/getEmoji.js')
const updateCard = require('../../cardFunctions/updateCards.js')

module.exports = {
  name: 'auction',
  aliases: ['auc', 'market'],
  description: 'Auction is where you buy/sell your cards.',
  subcommands: [
    '`start <name> <start-price> [time = 1h 1d]`: Start an auction',
    '`search [filters = --role, --ovr >|<|number`: Shows a list of cards ordered by descending date.',
    '`bid <ID> <dogecoins>`: Bid on a card and you will get the card when the time ends.',
  ].join('\n'),
  category: 'Cards',
  syntax: 'e.auction [subcommands]',
  cooldown: 5,
  run: async ({ message, args, client }) => {
    const { channel, author, content } = message
    const data = await db.findOne({ _id: author.id })

    const startAlias = ['start', '+', 'add']
    const searchAlias = ['search', 'find', '?']
    const bidAlias = ['bid', 'buy']

    const allAuctions = await auctionsDB.find()
    
    if (startAlias.includes(args[0])) {
      if (args.length < 4) message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      let card = await cardSearch([args[1]])
      let startPrice = parseInt(args[2])
      let time = ms(args[3] || '24h')

      // validations
      if (!card) return message.reply(`Could not find card \`${args[1]}\``)
      else if (isNaN(startPrice)) return message.reply(`Could not parse \`${args[2]}\` as price.`)
      else if (!time || time < 0) return message.reply(`Could not parse \`${args[3]}\` as time`)
      else if (time < 60 * 60 * 1000) return message.reply('Time must atleast be greater than 1 minute')
      else if (!data.cards.some(c => c._id === card._id)) return message.reply(`You do not own \`${card.name}\`.`)
      else if (data.cards?.[0]?.team?.some(c => c._id === card._id)) return message.reply(`Cards in your team can't be auctioned.`)

      let id = allAuctions.sort((a, b) => b._id - a._id)?.[0]?._id || 1
      let auctionData = auctionsDB({
        _id: id,
        owner: author,
        card: card,
        startBid: startPrice,
        currentBid: startPrice,
        currentBidder: author,
        start: Date.now(),
        end: (Date.now() + time),
      })

      await updateCard(data, card, 'cards', true)
      await auctionData.save(e => console.log(e || auctionData._id))
      await message.reply(`Auction started for \`${card.name}\` at ${await getEmoji('coin')} ${startPrice} for \`${args[3]}\``)
      return
    } else if (searchAlias.includes(args[0])) {
      const matches  = allAuctions
      const filters = {
        'role': /\b--role\s(\w+)/.exec(content)?.[1],
        'ovr': /\b--ovr\s(\w+)\s(\w+)/.exec(content)?.[1]?.split(/ +/)?.slice(1),
        'name': /\b--name\s(\w+)/.exec(content)?.[1]
      }
      console.log(filters)
    } else if (bidAlias.includes(args[0])) {
      if (args.length < 3) message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))

    } else {
      await message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      return
    }
  }
}