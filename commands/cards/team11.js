//const sharp = require('sharp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')
const db = require('../../schemas/player.js')
const cardsDB = require('../../schemas/card.js')
const getError = require('../../functions/getErrors.js')
const embedColor = require('../../functions/getEmbedColor.js')
const fs = require('fs')
const cardSearch = require('../../cardFunctions/cardSearch.js')
const updateCard = require('../../cardFunctions/updateCards.js')
const openBox = require('../../functions/openBox.js')

module.exports = {
  name: 'team11',
  aliases: ['club', 'squad', 'team', '11'],
  description: 'Show\'s your team11 or you can modify your team with the subcommands.',
  category: 'Games',
  syntax: 'e.team [subcommands]',
  subcommands: '`replace [toBeReplaced] [toReplace]`: Swap two players mentioned in the arguments.\n`swap [name1] [name2]:` Swaps the position in the team of the two cards mentioned in the arguments.',
  cooldown: 20,
  run: async ({ message, args, client }) => {
    /*const { channel, content, author, member } = message
    
    const target = author
    target.displayName = member.displayName
    
    let data = await db.findOne({ _id: target.id })
    
    //No team, give starters
    if (!(data.cards && data.cards[0] && data.cards[0].team) || data.cards[0].team.length < 11) {
      let starters = await openBox(11, data, message, 'cricket', -75)
      Promise.all([
        await updateCard(data, starters, 'team11')
      ])
      await updateCard(data, starters, 'slots')
      await message.reply('You have been given 11 starter cards!')
      return
    }
    
    const team = (data.cards && data.cards[0] && data.cards[0].team) || (data.cards && data.cards.slice(1))
    const cards = await cardsDB.find()
    
    let nicknameAlias = ['nick', 'nickname', 'name']
    let replaceAlias = ['replace', 'r']
    let swapAlias = ['pos', 'swap', 's']
    
    //Replace and Swap
    if (replaceAlias.includes(args[0]) || swapAlias.includes(args[0])) {
      if (args.length < 3) return message.reply(getError({ error: 'syntax', filePath: 'cards/team11.js' }))
      
      let toReplace = await cardSearch([args[2]])
      let toBeReplaced = await cardSearch([args[1]])
      // Card Existence Validation
      if (!toReplace || !toBeReplaced) return message.reply(`Cannot find card: \`${toReplace ? args[2] : args[1]}\``)
      
      if (swapAlias.includes(args[0])) {
        //Card Existence in team
        if (!team.some(c => c._id === toBeReplaced._id)) return message.reply(`Can\'t find ${toBeReplaced.name} in your team.`)
        else if (!team.some(c => c._id === toReplace._id)) return message.reply(`Can\'t find ${toReplace.name} in your team.`)
        
        await updateCard(data, toBeReplaced, 'team11', true, [toReplace], team.findIndex(card => card._id === toReplace._id))
        await message.reply(`Positions swapped, \`${toBeReplaced.name}\` <--> \`${toReplace.name}\``)
      } else {
        //Card Existence in team and slots
        if (team.some(card => card._id === toReplace._id)) return message.reply(`\`${toReplace.name}\` already exists in your team, you \`e.team swap\` to swap positions`)
        else if (!team.some(card => card._id === toBeReplaced._id)) return message.reply(`Cannot find card \`${toBeReplaced.name}\` in your team`)
        else if (!data.cards.some(card => card._id === toReplace._id)) return message.reply(`Cannot find card \`${toReplace.name}\` in your slots`)
        
        // Min and Max Role Validations
        let max = {'bat': 5, 'bowl': 3, 'ar': 2, 'wk': 2}
        let min = {'bat': 4, 'bowl': 3, 'ar': 1, 'wk': 1}
        if (toBeReplaced.role !== toReplace.role && team.filter(card => {
            if (card.role === toReplace.role) return true
          }).length >= max[toReplace.role]
        ) return message.reply(`The maximum amount of \`${toReplace.role.toUpperCase()}\` players in team is ${max[toReplace.role]}`)
        else if (toBeReplaced.role !== toReplace.role && team.filter(card => {
            if (card.role === toBeReplaced.role) return true
          }).length <= min[toBeReplaced.role]
        ) return message.reply(`The minimum amount of \`${toBeReplaced.role.toUpperCase()}\` players in team is ${min[toBeReplaced.role]}`)
        
        //UpdateCards
        Promise.all([
          updateCard(data, toBeReplaced, 'team11', true, [toReplace]),
        ])
        await message.reply(`Replaced \`${toBeReplaced.name}\` with \`${toReplace.name}\``)
      }
      return
    }
    
    //Nickname
    else if (nicknameAlias.includes(args[0])) {
      if (args.length < 1) return message.reply(getError({ error: 'syntax', filePath: 'cards/team11.js' }))
      let name = args.slice(1).join(' ')
      await db.findOneAndUpdate({ _id: target.id }, {
        "cards": [{
          team: (data.cards && data.cards[0].team) || [],
          slots: (data.cards && data.cards[0].slots) || 21,
          name: name || `${author.displayName}'s team`
        }, ...data.cards.slice(1)]
      })
      await message.reply(`Team name set to \`${name}\``)
      return
    }
    
    //Image
    let exportPath = `./temp/${target.id}.png`;
    let bgPath = './assets/team11.jpg'
    
    let roles = {
      'bat': [], 'bowl': [], 'ar': [], 'wk': []
    }
    //Write the Image temporarily
    async function writeImage(resolve) {
      if (team.length > 0) {
        let compositeObjs = []
        
        let i = 0;
        await team.slice(0, 11).forEach(async card => {
          i += 1
          let name = card.name
          let path = `./assets/cards/${name}.png`
          let pos = teamPos[parseInt(i)]
          
          compositeObjs.push({
            input: path,
            left: pos[0],
            top: pos[1],
          })
          
          roles[card.role].push(card.name.charAt(0).toUpperCase() + card.name.slice(1).toLowerCase())
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
      .setTitle(`${(data.cards && data.cards[0] && data.cards[0].name) || target.displayName} Team11`)
      .attachFiles(exportPath)
      .setDescription([
        `**BAT:**     ${roles.bat.join(', ')}`,
        `**WK:**       ${roles.wk.join(', ')}`,
        `**BOWL:**   ${roles.bowl.join(', ')}`,
        `**AR:**        ${roles.ar.join(', ')}`,
      ].join('\n'))
      .setImage(`attachment://${exportPath.split('/').pop()}`)
      .setFooter('"e.cards" to view your cards.')
      .setColor(embedColor)
    await message.channel.send(embed)
    
    //Set cooldown
    const timestamps = client.cooldowns.get('team11');
    timestamps.set(author.id, Date.now());
    setTimeout(() => timestamps.delete(author.id), 60 * 10 * 1000);
    
    await new Promise(r => setTimeout(r, 5000))
    await fs.unlink(exportPath, (e) => e ? console.log(e) : false)*/
  }
}