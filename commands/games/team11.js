const sharp = require('sharp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')
const db = require('../../schemas/player.js')
const cardsDB = require('../../schemas/card.js')
const getTarget = require('../../functions/getTarget.js')
const getError = require('../../functions/getErrors.js')
const embedColor = require('../../functions/getEmbedColor.js')
const fs = require('fs')
const cardSearch = require('../../cardFunctions/cardSearch.js')
const updateCard = require('../../cardFunctions/updateCards.js')

module.exports = {
  name: 'team11',
  aliases: ['club', 'squad', 'team', '11'],
  description: 'Show\'s your team11 or you can modify your team with the subcommands.',
  category: 'Games',
  syntax: 'e.team [subcommands]',
  subcommands: '`replace [toBeReplaced] [toReplace]`: Swap two players mentioned in the arguments.',
  run: async ({ message, args, client }) => {
    const { channel, content, author } = message
    
    const target = await getTarget(message, args, client)
    const data = await db.findOne({ _id: target.id })
    const team = data.cards?.[0]?.team || data.cards?.slice(1)
    const cards = await cardsDB.find()
    
    let replaceAlias = ['replace', 'rep', 'swap', 'r']
    if (replaceAlias.includes(args[0])) {
      let replace = [args[1], args[2]]
      
      if (args.length < 3) return message.reply(getError({ error: 'syntax', filePath: 'games/team11.js' }))
      
      let toReplace = await cardSearch([replace[1]])
      let toBeReplaced = await cardSearch([replace[0]])
      
      if (!toReplace || !toBeReplaced) return message.reply(`Cannot find card: \`${toReplace ? replace[0] : replace[1]}\``)
      if (!team.find(x => x == toBeReplaced.fullname)) return message.reply(`Cannot find card \`${toBeReplaced.name}\` in your team`)
      if (!data.cards?.find(x => x == toReplace.fullname)) return message.reply(`Cannot find card \`${toReplace.name}\` in your slots`)
      
      await updateCard(data, toBeReplaced, 'team11', true, [toReplace])
      await message.reply(`Replaced \`${toBeReplaced.name}\` with \`${toReplace.name}\``)
      return
    }
    
    let exportPath = `./temp/${target.id}.png`;
    let bgPath = './assets/team11.jpg'
    
    async function writeImage(resolve) {
      if (team.length > 0) {
        let compositeObjs = []
        
        let i = 0;
        await team.slice(0, 11).forEach(async fullname => {
          i += 1
          let card = cards.find(x => x.fullname == fullname)
          let name = card.name
          let path = `./assets/cards/${name}.png`
          let pos = teamPos[parseInt(i)]
          
          compositeObjs.push({
            input: path,
            left: pos[0],
            top: pos[1],
          })
        })
        
        await sharp(bgPath)
          .composite(compositeObjs)
          .sharpen()
          .toFile(exportPath)
        resolve()
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