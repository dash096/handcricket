const executeUnoMatch = require("../../unoFunctions/match.js")

module.exports = {
  name: "uno",
  description: "Play UNO with your friend(s)",
  syntax: "e.uno",
  cooldown: 10,
  status: true,
  run: executeUnoMatch
}
