




const jimp = require('jimp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')

module.exports = {
  name: 'e',
  run: async ({ message, args }) => {
    let name = args[0] || 'kohli'
    let row = args[1] || 1
    let col = args[2] || 1
    let path = `./assets/cards/${name}.png`
    let bg = './assets/team11.jpg'
    
    let bgImg = await jimp.read(bg)
    let cardImg = await jimp.read(path)
    await bgImg
          .composite(cardImg, teamPos['x'][row][col], teamPos['y'][col])
          .write('./temp/i.png')
    
    let attachment = new Discord.MessageAttachment('./temp/i.png')
    await message.channel.send('text', {
      files: [attachment]
    })
  }
}