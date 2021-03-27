const db = require("../schemas/player.js");
const itemDB = require("../schemas/items.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const checkItems = require("../functions/checkItems.js");

module.exports = {
  name: 'send',
  aliases: ['give'],
  description: 'send some pc to another user, mercy.',
  category: 'handcricket',
  run: async ({message}) => {
    //e.send @ping c/coins 1
    //e.send @ping item_name 1
  }
};