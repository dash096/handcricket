

const playerDB = require("../schemas/player.js");
const itemDB = require("../schemas/items.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop',
  category: 'handcricket',
  run: async ({message}) => {
    const args = message.content.trim().split(' ').slice(1);
    const name = args[0]
    const amount = parseInt(args[1]) || 1
    
    console.log(name, amount);
  }
}