let duoInnings = require('../../cricketFunctions/duoInnings.js')

module.exports = {
  name: 'cpu',
  syntax: 'e.cpu',
  run: async ({ message }) => {
    let { content, channel, author } = message

    let challenge = {
      CPU: {
        id: 'CPU',
        username: 'CPU',
        send: function(i) { console.log(i) },
      },
      wickets: 2,
      overs: 8,
      target: (Math.floor(Math.random() * 100)),
      innings: 2,
      max: 6,
      post: false,
      type: 'bat',
      player: author
    }

    await channel.send(`setted up match for\n Chasing ${target} in ${overs * 6} balls with ${wickets} wickets`)
    await duoInnings(author, challenge.CPU, message, false, 6, challenge.wickets, challenge.overs, challenge)
  }
}