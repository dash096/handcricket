const duoInnings = require('../../cricketFunctions/duoInnings.js')
const db = require('../../schemas/player.js')

module.exports = {
  name: 'cpu',
  syntax: 'e.cpu',
  run: async ({ message }) => {
    let { content, channel, author } = message

    let data = await db.findOne({ _id: author.id })
    
    let challenge = {
      CPU: {
        id: 'CPU',
        username: 'CPU',
        send: function(i) { console.log(i) },
      },
      wickets: 2,
      overs: 8,
      target: 109,
      innings: 2,
      max: 6,
      post: false,
      type: 'bat',
      player: author,
      start: false,
      message: message,
      currentScore: 69,
    }
    challenge.player.data = data
    challenge.player.pattern = data.pattern
    challenge.player.pattern = Object.entries(challenge.player.pattern).sort((a, b) => b[1] - a[1])
    challenge.player.pattern = map(x => x[0], challenge.player.pattern)

    await channel.send(`setted up match for\n Chasing ${challenge.target} in ${challenge.overs * 6} balls with ${challenge.wickets} wickets`)
    await duoInnings(challenge.player, challenge.CPU, message, false, 6, challenge.wickets, challenge.overs, challenge)
  }
}