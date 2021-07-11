const jimp = require('jimp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')
const db = require('../../schemas/player.js')
const cardsDB = require('../../schemas/card.js')
const getTarget = require('../../functions/getTarget.js')
const embedColor = require('../../functions/getEmbedColor.js')
const fs = require('fs')

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
    
    
    async function writeImage(resolve) {
      let bgPath = './assets/team11.jpg'
      let bgImg = await jimp.read(bgPath)
      let exportPath = `./temp/${target.id}.png`;
        
      if (team.length > 0) {
        let i = 0;
        await team.slice(0, 11).forEach(async fullname => {
          i += 1
          let card = cards.find(x => x.fullname == fullname)
          let name = card.name
          let path = `./assets/cards/${name}.png`
          let pos = teamPos[parseInt(i)]
          
          if (i === 11) {
            bgImg
              .composite(await jimp.read(path), pos[0], pos[1])
              .write(exportPath);
            resolve()
          } else {
            bgImg
              .composite(await jimp.read(path), pos[0], pos[1])
          }
        })
      }
    }
    
    await new Promise(async r => {
      await writeImage(r)
    })
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`${target.displayName}'s Team11`)
      .attachFiles(exportPath)
      .setImage(`attachment://${exportPath.split('/').pop()}`)
      .setFooter('"e.cards" to view your cards.')
      .setColor(embedColor)
    await message.channel.send(embed)
    
    await new Promise(r => setTimeout(r, 5000))
    await fs.unlink(exportPath, (e) => e ? console.log(e) : false)
  }
}