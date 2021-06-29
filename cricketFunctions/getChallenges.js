let challenges = {
  'classic': {
    1: {
      innings: 2,
      type: 'bat',
      wickets: 2,
      overs: 4,
      currentScore: 0,
      oldLogs: { ballArray: [0, 1], batArray: [0, 50] },
      doubleInnings: false,
    },
    2: {
      innings: 2,
      type: 'bowl',
      wickets: 1,
      overs: 10,
      currentScore: 65,
      oldLogs: { ballArray: [0, 1], batArray: [0, 98] },
      doubleInnings: false,
    },
    3: {
      innings: 2,
      type: 'bat',
      wickets: 1,
      overs: 5,
      currentScore: 34,
      oldLogs: { ballArray: [0, 1], batArray: [0, 70] },
      doubleInnings: false,
    },
    4: {
      innings: 2,
      type: 'bowl',
      wickets: 1,
      overs: 2,
      currentScore: 1,
      oldLogs: { ballArray: [0, 1], batArray: [0, 50] },
      doubleInnings: false,
    },
    5: {
      CPU: {
        id: 'CPU',
        username: 'CPU',
        send: function(i) { console.log(i) },
      },
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
  let progress = progress.split('_')[1]
  let challenge = challenges[mode][progress]
  
  challenge.CPU = {
    id: 'CPU',
    username: 'CPU',
    send: function(i) { console.log(i) },
  }
  challenge.player = message.author
  challenge.message = message
  
  return challenge
}
