









//absolute: ./unoFunctions/match.js
const Discord = require("discord.js")
const collectUsers = require("../functions/collectUsers.js")
const getEmoji = require("../functions/getEmoji.js")

module.exports = async ({ message, client, args, prefix }) => {
  const {channel, author} = message
  
  try {
    var players = await collectUsers(message, "UNO", 2)
    var playerTags = players.map(p => p.id)
  } catch (e) {
    await message.reply(e)
    return
  }
  
  const cards = [
    'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9',
    'g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9',
    'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9',
    'y0', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9',
    'rSkp', 'gSkp', 'bSkp', 'ySkp', 'rSkp', 'gSkp', 'bSkp', 'ySkp',
    'rRev', 'gRev', 'bRev', 'yRev', 'rRev', 'gRev', 'bRev', 'yRev',
    'r2p', 'g2p', 'b2p', 'y2p', 'r2p', 'g2p', 'b2p', 'y2p',
    'wd', 'wd', 'wd', 'wd',
    'w4p', 'w4p', 'w4p', 'w4p'
  ]
  
  let shuffled = cards
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
  
  let discardBlock = []
  let intakeBlock = []
  let currentCards = {}
  
  players.forEach((p, i) => {
    currentCards[p.id] = shuffled.slice(7*i, 7*(i+1))
  })
  
  intakeBlock = shuffled.slice((players.length)*7)
  
  let startEmbed = new Discord.MessageEmbed()
    .setTitle("Match has started!")
    .setDescription(`Move to your DMs y'all,\n ${playerTags.join("\n")}`)
    .setFooter("Have Fun!")
  await channel.send(startEmbed)
  
  await channel.send("WIP\n" + JSON.stringify(currentCards))
}

