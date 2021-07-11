




const jimp = require('jimp')
const teamPos = require('../../cardFunctions/teamPos.js')
const Discord = require('discord.js')

module.exports = {
  name: 'e',
  run: async ({ message, args }) => {
    let name = args[0] || 'kohli'
    
    let row = args[1] || 1
    let col = args[2] || 1
    let xpx = teamPos['x'][row][col]
    let ypx = teamPos[row]
    
    let path = `./assets/cards/${name}.png`
    let bg = './assets/team11.jpg'
    
    let bgImg = await jimp.read(bg)
    let cardImg = await jimp.read(path)
    await bgImg
          .composite(await cardImg, xpx, ypx)
          .write('./temp/i.png')
    
    console.log(xpx, ypx)
    
    await new Promise(r => setTimeout(r, 2000))
    await message.channel.send('text', {
      files: ['./temp/i.png']
    })
  }
}