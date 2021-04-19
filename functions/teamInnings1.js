const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('./getEmbedColor.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');

module.exports = async (battingTeam, bowlingTeam, channel) => {
  console.log(battingTeam, bowlingTeam);
};