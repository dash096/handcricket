const db = require("../../schemas/player.js");
const Discord = require("discord.js");

module.exports = {
  name: "start",
  aliases: ["play"],
  description: "Creates a Database",
  category: 'Cricket',
  syntax: 'e.start',
  cooldown: 30,
  run: async (message) => {
    const player = new db({
      _id: message.author.id,
      startedOn: Date.now()
    });

    player.save(e => {
      if (e) {
        console.log(e);
        message.reply("You are already a player nab.");
        return;
      }

      message.reply("Get the party started");
    });
  }
};