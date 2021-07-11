const getTarget = require('../../functions/getTarget.js')
const db = require('../../schemas/player.js')
const Discord = require('discord.js')
const embedColor = require('../../functions/getEmbedColor.js')
const gain = require('../../functions/gainExp.js')
const cardsDB = require('../../schemas/card.js')

module.exports = {
  name: 'cards',
  aliases: ['card'],
  description: 'Show\'s all of your card slots.',
  category: 'Games',
  syntax: 'e.cards',
  run: async ({ message, args, client }) => {
    const { channel, author, content } = message
    
    const target = await getTarget(message, args, client)
    
    const data = await db.findOne({ _id: target.id })
    const targetCards = data.cards.slice(1)
    
    let text = []
    for(let fullname in targetCards) {
      fullname = targetCards[fullname]
      let card = await cardsDB.findOne({ fullname: fullname })
      card.name = card.name.split('-').join(' ')
      text.push([`${card.name.charAt(0).toUpperCase() + card.name.slice(1)}   |   \`${card.role.toUpperCase()}\`   |   ${card.ovr}`, card.ovr])
    }
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
      .setFooter(`Page ${page} of ${max}, '${data?.cards?.slice(1).length - 1 || 10}' free of '${data?.cards?.[0]?.slots || 10}'`)
    let cardsMessage = await message.reply(embed)
    
    if(text.length > 15) {
      let goToPage = parseInt(args[0]) || parseInt(args[1])
      if (goToPage) {
        if (goToPage > max) page = max
        else page = goToPage
      }
      
      async function loopPage() {
        if (counter === 5) return
        try {
          await cardsMessage.react('◀️')
          await cardsMessage.react('▶️')
          
          let reaction = Array.from((await cardsMessage.awaitReactions(
            (r, u) => ['▶️', '◀️'].includes(r.emoji.name) && u.id === author.id,
            { max: 1, time: 30000 }
          )).keys())[0]
          counter += 1
          
          if (reaction === '◀️') {
            if (page !== 1) {
              page -= 1
              embed.setDescription(text.slice(15 * page - 15, 15 * page))
              await cardsMessage.edit(embed)
            }
          } else {
            if (page !== max) {
              embed.setDescription(text.slice(15 * page, 15 * page + 15))
              page += 1
              await cardsMessage.edit(embed)
            }
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