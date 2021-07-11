




const jimp = require('jimp')
const teamPos = require('../../cardFunctions/teamPos.js')

module.exports = {
  name: 'e',
  run: async ({ message, args }) => {
    let name = args[0] || 'kohli'
    let x = args[1] || 1
    let y = args[2] || 1
    let path = `./assets/cards/${name}.png`
    let bg = './assets/team11.png'
    
    let bgImg = await jimp.read(bg)
    let cardImg = await jimp.read(path)
    await bgImg
          .composite(cardImg, teamPos['x'][x], teamPos[y])
          .write('./temp/i.png')
    await channel.send('text', {
      files: ['./temp/i.png']
    })
  }
}