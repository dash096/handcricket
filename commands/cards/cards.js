const getTarget = require('../../functions/getTarget.js')
const db = require('../../schemas/player.js')
const Discord = require('discord.js')
const embedColor = require('../../functions/getEmbedColor.js')
const gain = require('../../functions/gainExp.js')
const cardsDB = require('../../schemas/card.js')
const getCardImage = require('../../cardFunctions/getImage.js')
const cardSearch = require('../../cardFunctions/cardSearch.js')

module.exports = {
  name: 'cards',
  aliases: ['card'],
  description: 'Show\'s all of your card slots that aren\'t in your team11.',
  category: 'Cards',
  syntax: 'e.cards',
  cooldown: 5,
  run: async ({ message, args, client }) => {
    const { channel, author, content } = message
    
    const target = await getTarget(message, args, client)
    
    const data = await db.findOne({ _id: target.id })
    const targetCards = data.cards?.slice(1)
    const targetTeam = data.cards?.[0]?.team
    
    //Send Image of the Card if arguments exists
    if (args.length > 0 && target.id === author.id) {
      let card = await cardSearch(args)
      if(!card) return message.reply('Couldn\'t find one in that name.')
      
      let image = await getCardImage(card.fullname)
      let embed = new Discord.MessageEmbed()
        .setTitle(`${(card.fullname.charAt(0).toUpperCase() + card.fullname.slice(1).toLowerCase()).split('_').join(' ')}`)
        .setFooter(targetCards.includes(card.fullname) ? `${author.displayName}'s card` : `${author.displayName} doesn\'t own this card`)
        .setColor(embedColor)
      if (image == 'err') {
        embed
          .attachFiles(`./assets/cards/${card.name}.png`)
          .setImage(`attachment://${card.name}.png`)
        let msg = await message.reply(embed)
        await getCardImage(card.fullname, msg.embeds[0].image.url)
      } else {
        embed.setImage(image)
        await message.reply(embed)
      }
      return
    }
    
    //Send a list of slots
    let text = []
    targetCards.forEach(card => {
      card.name = card.name.split('-').join(' ')
      text.push([`${card.name.charAt(0).toUpperCase() + card.name.slice(1).toLowerCase()}   |   \`${card.role.toUpperCase()}\`   |   ${card.ovr}${targetTeam.some(x => x._id === card._id) ? '    🗡️' : ''}`, card.ovr])
    })
    text = text.sort((a, b) => b[1] - a[1])
    text = text.map(i => i[0])
    text.map((x, i) => {
      text[i] = `\`${i + 1})\`  ` + text[i]
    })
    
    let counter = 0
    let page = 1
    let max = Math.floor(text.length/15) + 1
    const embed = new Discord.MessageEmbed()
      .setTitle(`${target.displayName}'s Cards`)
      .setDescription(text.slice(0, 15).join('\n'))
      .setColor(embedColor)
      .setFooter(`Page ${page} of ${max}, '${((targetCards?.[0]?.slots) || 21) - ((data?.cards?.slice(1).length) || 21)}' free of '${(data?.cards?.[0]?.slots) || 21}' slots`)
    let goToPage = parseInt(args[0]) || parseInt(args[1])
    if (goToPage && goToPage > 1) {
      page = goToPage > max ? max : goToPage
      embed.setDescription(text.slice(15 * page - 15, 15 * page))
    }
    let cardsMessage = await message.reply(embed)
    //Set cooldown
    const timestamps = client.cooldowns.get('cards');
    timestamps.set(author.id, Date.now());
    setTimeout(() => timestamps.delete(author.id), 60 * 10 * 1000);
    
    //Page switching
    if(text.length > 15) {
      loopPage()
      async function loopPage() {
        if (counter > 5) return
        try {
          await cardsMessage.react('◀️')
          await cardsMessage.react('▶️')
          
          let reaction = Array.from((await cardsMessage.awaitReactions(
            (r, u) => ['▶️', '◀️'].includes(r.emoji.name) && u.id === author.id,
            { max: 1, time: 30000 }
          )).keys())[0]
          counter += 1
          
          if (reaction === '◀️' && page !== 1) {
            page -= 1
            embed.setDescription(text.slice(15 * page - 15, 15 * page))
            await cardsMessage.edit(embed)
          } else if (reaction === '▶️' && page !== max) {
            embed.setDescription(text.slice(15 * page, 15 * page + 15))
            page += 1
            await cardsMessage.edit(embed)
          }
          return loopPage()
        } catch (e) {
          return
        }
      }
    }
    await gain(data, 0.5, message);
  }
}
