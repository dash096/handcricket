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
      if (args.length < 3) return message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
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

      let id = allAuctions.sort((a, b) => b._id - a._id)?.[0]?._id || 1070000
      let auctionData = auctionsDB({
        _id: (id + 1),
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
      const filters = {
        'role': (/\s--role\s(\w+)/.exec(content)?.[1])?.toLowerCase(),
        'ovr': /\s--ovr\s(\W+\w+|\w+)+/.exec(content)?.[1]?.split(' '),
        'name': /\s--name\s(\w+)/.exec(content)?.[1],
      }
      let queryCard = filters.name ? await cardSearch([filters.name]) : undefined
      
      // Validations
      if (filters.role && !['bat', 'bowl', 'wk', 'ar'].includes(filters.role)) return message.reply(`Valid roles are \`${validRoles.join(', ')}\``)
      if (!queryCard && filters.name) return message.reply(`Could not find card \`${filters.name}\``)
      if (
        filters.ovr && !(
          parseInt(filters.ovr) ||
          ( parseInt(filters.ovr.slice(2)) && (
            filters.ovr[0] === '>' ||
            filters.ovr[0] === '<'
          ))
        )
      ) return message.reply(`Invalid value for ovr filter, use it like \`--ovr > 70\`, \`--ovr < 70\`, \`--ovr 70\``)
      
      let matching = allAuctions.slice(0, 75).filter(async auc => {
        let tests = 0
        let keys = Object.keys(filters)
        for(let i in keys) {
          if(filters[keys[i]]) tests += 1
        }
        let passed = 0
        
        if (queryCard?._id === auc.card._id) passed += 1
        if (filters.role === auc.card.role) passed += 1
        if (filters.ovr &&
          filters.ovr?.[0] === '>'
          ? auc.card.ovr > parseInt(filters.ovr.slice(2))
          : filters.ovr?.[0] === '<'
          ? auc.card.ovr < parseInt(filters.ovr.slice(2))
          : auc.card.ovr === parseInt(filters.ovr)
        ) passed += 1
        
        if (passed === tests) return true
      })
      
      if (matching.length < 1) return message.reply('No results!')
      
      matching = matching.reverse().map((match, index) => `\`${match._id})\`  ${match.card.name.charAt(0).toUpperCase() + match.card.name.slice(1)}  |  \`${match.card.role.toUpperCase()}\`  |  ${match.card.ovr}  |  ${await getEmoji('coin')} ${match.currentBid}  |  ${ms(match.end.getTime() - Date.now())}`)
      let counter = 0
      let page = 1
      const embed = new Discord.MessageEmbed()
        .setTitle('Auctions')
        .setColor(embedColor)
        .setDescription(`**Id) Name | Role | OVR | Price | EndsIn**\n` + matching.slice(0, 15).join('\n'))
        .setFooter(`Page ${page} of ${Math.floor(matching.length/15) + 1}, you can bid "e.auc bid <id> <dogecoins>"`)
      await message.reply(embed)
      return 
    } else if (bidAlias.includes(args[0])) {
      if (args.length < 3) message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))

    } else {
      await message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      return
    }
  }
}