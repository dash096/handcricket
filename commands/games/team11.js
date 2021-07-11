const jimp = require('jimp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')
const db = require('../../schemas/player.js')
const cardsDB = require('../../schemas/card.js')
const getTarget = require('../../functions/getTarget.js')
const embedColor = require('../../functions/getEmbedColor.js')

module.exports = {
  name: 'team11',
  aliases: ['club', 'squad', 'team', '11'],
  description: 'Show\'s your team11',
  category: 'Games',
  syntax: 'e.team',
  run: async ({ message, args, client }) => {
    const { channel, content, author } = message
    
    const target = await getTarget(message, args, client)
    const data = await db.findOne({ _id: target.id })
    const team = data.cards?.[0]?.team?.[0] || data.cards?.slice(1)
    const cards = await cardsDB.find()
    
    let exportPath = `./temp/${target.id}.png`
    let bg = './assets/team11.jpg'
    let bgImg = await jimp.read(bg)
    
    for (let i in team.slice(0, 11)) {
      let fullname = team[i]
      let card = cards.find(x => x.fullname == fullname)
      let name = card.name
      
      let pos = teamPos[parseInt(i) + 1]
      let xpx = pos[0]
      let ypx = pos[1]
      
      let cardPath = `./assets/cards/${name}.png`
      let cardImg = await jimp.read(cardPath)
      
      if (i === 10) {
        await bgImg
          .composite(cardImg, xpx, ypx)
          .write(exportPath)
      } else {
        await bgImg
          .composite(cardImg, xpx, ypx)
      }
    }
    
    await new Promise(r => setTimeout(r, 2000))
    const embed = new Discord.MessageEmbed()
      .setTitle(`${target.displayName}'s Team11`)
      .attachFiles(exportPath)
      .setImage(`attachment://${exportPath.split('/').pop()}`)
      .setFooter('"e.cards" to view your cards.')
      .setColor(embedColor)
    await message.channel.send(embed)
  }
}