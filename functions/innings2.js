const db = require("../schemas/player.js");
const Discord = require("discord.js");

//shuffled
module.exports = async function(bowler, batsman, target) {
  bowler.send("2nd Innings starts");
  batsman.send("2nd Innings ");
};
