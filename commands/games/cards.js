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
    let i = 0
    text.map(x => {
      text[i] = `\`${i + 1})\`  ` + text[i]
      i += 1
    })
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`${target.displayName}'s Cards`)
      .setDescription(text.slice(0, 15).join('\n'))
      .setColor(embedColor)
      .setFooter('"e.team" to view your team11.')
    
    let cardsMessage = await message.reply(embed)
    
    let counter = 1;
    let max = Math.floor(text.length/15) + 1
    if (text.length > 15) loopPage()
    async function loopPage() {
      try {
        await cardsMessage.react('◀️')
        await cardsMessage.react('▶️')
        
        let collection = await cardsMessage.awaitReactions(
          (r, u) => ['▶️', '◀️'].includes(r.emoji.name) && u.id === author.id,
          { max: 1, time: 30000 }
        )
        let reaction = Array.from(collection.keys())[0]
        
        if (reaction === '◀️') {
          if (counter !== 1) {
            counter -= 1
            embed.setDescription(text.slice(counter === 1 ? 0 : 15 * counter - 15, 15 * counter))
          }
        } else {
          if (counter !== max) {
            embed.setDescription(text.slice(15 * counter, 15 * counter + 15))
            counter += 1
          }
        }
        await cardsMessage.edit(embed);
        return loopPage()
      } catch (e) {
        return
      }
    }
    
    await gain(data, 0.5, message);
  }
}