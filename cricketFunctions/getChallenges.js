let challenges = {
  'classic': {
    1: {
      info: 'Score 50 runs in 4 overs with 2 wickets.',
      innings: 2,
      type: 'bat',
      wickets: 2,
      overs: 4,
      currentScore: 0,
      oldLogs: { ballArray: [0, 1], batArray: [0, 50] },
      doubleInnings: false,
    },
    2: {
      info: 'Win before the bot chases this target.',
      innings: 2,
      type: 'bowl',
      wickets: 1,
      overs: 10,
      currentScore: 65,
      oldLogs: { ballArray: [0, 1], batArray: [0, 98] },
      doubleInnings: false,
    },
    3: {
      info: 'Chase this target.',
      innings: 2,
      type: 'bat',
      wickets: 1,
      overs: 5,
      currentScore: 34,
      oldLogs: { ballArray: [0, 1], batArray: [0, 70] },
      doubleInnings: false,
    },
    4: {
      info: 'Take a wicket in 12 balls.',
      innings: 2,
      type: 'bowl',
      wickets: 1,
      overs: 2,
      currentScore: 1,
      oldLogs: { ballArray: [0, 1], batArray: [0, 50] },
      doubleInnings: false,
    },
    5: {
      info: 'Win this match.',
      innings: 1,
      type: 'bat',
      wickets: 1,
      overs: 5,
      currentScore: 0,
      oldLogs: { ballArray: [0], batArray: [0] },
      doubleInnings: true,
    },
  }
}

module.exports = (message, progress) => {
  let mode = progress.split('_')[0]
  let num = progress.split('_')[1]
  let challenge = challenges[mode][num]
  
  challenge.CPU = {
    id: 'CPU',
    username: 'CPU',
    send: function(i) { console.log(i) },
  }
  challenge.player = message.author
  challenge.message = message
  
  return challenge
}
