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
const updateCoins = require('../../functions/updateCoins.js')

module.exports = {
  name: 'auction',
  aliases: ['auc', 'market'],
  description: 'Auction is where you buy/sell your cards.',
  subcommands: [
    '`start <name> <start-price> [time = 1h 1d]`: Start an auction',
    '`search [filters = --name, --role, --ovr >|<|number`: Shows a list of cards ordered by descending date.',
    '`bid <ID> <dogecoins>`: Bid on a card and you will get the card when the time ends.',
    '`info <ID>`: Shows info of an auction.'
  ].join('\n'),
  category: 'Cards',
  syntax: 'e.auction [subcommands]',
  cooldown: 5,
  run: async ({ message, args, client }) => {
    const { channel, author, content } = message
    const coinsEmoji = await getEmoji('coin')
    const data = await db.findOne({ _id: author.id })

    const startAlias = ['start', '+', 'add']
    const searchAlias = ['search', 's', 'find', '?']
    const bidAlias = ['bid', 'buy']
    const infoAlias = ['info', 'i', 'information']

    const allAuctions = await auctionsDB.find()
    
    if (!args[0]) {
      await message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      return
    }
    
    else if (startAlias.includes(args[0].toLowerCase())) {
      if (args.length < 3) return message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      let card = await cardSearch([args[1]])
      let startPrice = parseInt(args[2])
      let time = ms(args[3] || '24h')

      // validations
      if (!card) return message.reply(`Could not find card \`${args[1]}\``)
      else if (isNaN(startPrice)) return message.reply(`Could not parse \`${args[2]}\` as price.`)
      else if (!time || time < 0) return message.reply(`Could not parse \`${args[3]}\` as time`)
      else if (time < 60 * 1000) return message.reply('Time must atleast be greater than 1 minute')
      else if (!data.cards.some(c => c === card._id)) return message.reply(`You do not own \`${card.name}\`.`)
      else if (data.cards?.[0]?.team?.some(c => c === card._id)) return message.reply(`Cards in your team can't be auctioned.`)

      let sorted = allAuctions.sort((a, b) => b._id - a._id)
      let id = sorted.length ? sorted[0]._id : 1070000
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
      
      //Confirmation
      try {
        await channel.send(`${author}, Do you want to auction \`${card.fullname.split('_').join(' ')}\` at ${coinsEmoji} \`${startPrice}\` for \`${args[3] || '24h'}\`, type \`y\`/\`n\``)
        let will = (await channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 15000 })).first().content.toLowerCase()
        if (will !== 'y' && will !== 'yes') return message.reply('Aborted.')
      } catch (e) {
        return channel.send(getError({ error: 'time' }))
      }

      await updateCard(data, card._id, 'slots', true)
      await auctionData.save(e => console.log(e || auctionData._id))
      await message.reply(`Auction started for \`${card.name}\` at ${coinsEmoji} ${startPrice} for \`${args[3] || "24h"}\``)
      
      //Timeout to finish auction
      setTimeout(async function timeout() {
        const auctionData = await auctionsDB.findOne({ _id: (id + 1) })
        
        const owner = author
        const ownerData = await db.findOne({ _id: author.id })
        const winner = client.users.cache.get(auctionData.currentBidder) || await client.users.fetch(auctionData.currentBidder)
        const winnerData = await db.findOne({ _id: winner.id })
        const card = auctionData.card

        await updateCard(winnerData, card._id, 'slots')
        if (auctionData.currentBidder !== auctionData.owner) {
          await updateCoins(auctionData.currentBid, ownerData)
          await owner.send(`Your auction for \`${card.name.charAt(0).toUpperCase() + card.namd.split('-').join(' ').slice(1)}\` has ended, and you recieved ${coinsEmoji} \`${auctionData.currentBid}\``)
        }
        await winner.send(`You won the auction for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\` for ${coinsEmoji} \`${auctionData.currentBid}\``)
        await auctionsDB.deleteOne({ _id: (id + 1) })
      }, time)
      return
    }
    
    
    else if (searchAlias.includes(args[0].toLowerCase())) {
      let filters = {
        'role': /\s--role\s(\w+)/.exec(content),
        'ovr': /\s--ovr\s(\W+\w+|\w+)/.exec(content),
        'name': /\s--name\s(\w+)/.exec(content),
      }
      
      filters = Object.fromEntries(Object
        .entries(filters)
        .map(
          ([k,v]) => ([k, v?.[1]?.toLowerCase()])
        )
      )
      
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
      
      let matching = allAuctions.slice(0, 75).filter(auc => {
        let tests = 0
        let keys = Object.keys(filters)
        for(let i in keys) {
          if(filters[keys[i]]) tests += 1
        }
        let passed = 0
        
        if (queryCard && queryCard._id === auc.card._id) passed += 1
        if (filters.role === auc.card.role) passed += 1
        if (filters.ovr &&
          filters.ovr[0] === '>'
          ? auc.card.ovr > parseInt(filters.ovr.slice(2))
          : filters.ovr?.[0] === '<'
          ? auc.card.ovr < parseInt(filters.ovr.slice(2))
          : auc.card.ovr === parseInt(filters.ovr)
        ) passed += 1
        
        if (passed === tests) return true
      })
      
      if (matching.length < 1) return message.reply('No results!')
      
      matching = matching.reverse().map((match, index) => [
        `\`${match._id}\``,
        `${match.card.name.charAt(0).toUpperCase() + match.card.name.slice(1)}`,
        `\`${match.card.role.toUpperCase()}\``,
        `\`${match.card.ovr}\``,
        `${coinsEmoji} ${match.currentBid}`,
        `\`${ms(match.end.getTime() - Date.now())}\``
      ].join('  |  '))
      let counter = 0
      let page = 1
      const embed = new Discord.MessageEmbed()
        .setTitle('Auctions')
        .setColor(embedColor)
        .setDescription(`\`Id | Name | Role | Ovr | CurrentBid | Time\`\n` + matching.slice(0, 15).join('\n'))
        .setFooter(`Page ${page} of ${Math.floor(matching.length/15) + 1}, you can bid "e.auc bid <id> <dogecoins>"`)
      await message.reply(embed)
      return 
    }
    
    
    else if (bidAlias.includes(args[0].toLowerCase())) {
      if (args.length < 3) return message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      let id = parseInt(args[1])
      let bid = parseInt(args[2])
      if (isNaN(id)) return message.reply('Invalid ID for auction')
      if (isNaN(bid)) return message.reply('Invalid value for bid')
      let auctionData = allAuctions.find(auc => auc._id === id)
      if (!auctionData) return message.reply('Could not find an auction with that ID')
      if (author.id === auctionData.owner) return message.reply('You cant bid on your own auction.')
      if (auctionData.currentBid >= bid) return message.reply(`Bid must be greater than the current bid which is ${coinsEmoji} ${auctionData.currentBid}`)
      if (bid > data.cc) return message.reply(`Insufficient Balance, it is lower than the ${bid}.`)
      let card = auctionData.card
      
      if (auctionData.currentBidder !== auctionData.owner) {
        (await client.users.fetch(auctionData.currentBidder)).send(`You have been outbid on the auction \`${auctionData._id}\` for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\``)
        await updateCoins(auctionData.currentBid, await db.findOne({ _id: auctionData.currentBidder }))
      }
      await updateCoins(-bid, data)
      await auctionsDB.findOneAndUpdate({ _id: auctionData._id }, {
        $set: {
          currentBidder: author,
          currentBid: bid,
          end: (auctionData.end.getTime() - Date.now()) < 2 * 60 * 1000 ? Date.now() + (5 * 60 * 1000) : auctionData.end.getTime()
        }
      })
      await message.reply(`Bidded on Auction \`${auctionData._id}\` for \`${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}\``)
      return
    }
    
    
    else if (infoAlias.includes(args[0].toLowerCase())) {
      if (args.length < 2) return message.reply(getError({ error: 'syntax', filePath: 'cards/auction.js' }))
      let auction = allAuctions.find(x => x._id === parseInt(args[1]))
      if (!auction) return message.reply(`Could not find auction with the Id \`${args[1]}\``)
      let { card } = auction
      const embed = new Discord.MessageEmbed()
        .setTitle(`Auction Card - ${card.name.charAt(0).toUpperCase() + card.name.split('-').join(' ').slice(1)}`)
        .setDescription([
          `**ID**:                   ${auction._id}`,
          `**Current Bid:**   ${coinsEmoji} ${auction.currentBid}`,
          `**Ends In:**            ${ms(auction.end.getTime() - Date.now(), { long: true })}`,
        ])
        .setFooter('To bid use, "e.bid <id> <dogecoins>')
        .setColor(embedColor)
      
      let cardImage = getCardImage(card.fullname)
      if (cardImage !== 'err') embed.setImage(cardImage)
      else {
        embed
          .attachFiles(`./assets/cards/${card.name}.png`)
          .setImage(`attachment://${card.name}.png`)
      }
      let infoMessage = await message.reply(embed)
      if (cardImage === 'err') getCardImage(card.fullname, infoMessage.embeds[0].image.url)
    }
  }
}