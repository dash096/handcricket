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
    
    let text = []
    for(let fullname in data.cards.slice(1)) {
      let card = await cardsDB.findOne({ fullname})
      text.push(`**${card.name.charAt(0) + card.name.slice(1)}** \`${card.role}\` *${card.ovr}*`)
    }
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`${target.displayName}'s Cards`)
      .setDescription(text.join('\n'))
      .setColor(embedColor)
      .setFooter('"e.team" to view your team11.')
    
    await message.reply(embed)
    await gain(data, 0.5, message);
  }
}