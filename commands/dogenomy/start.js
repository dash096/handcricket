const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../../functions/getEmoji.js');

module.exports = {
  name: "start",
  aliases: ["play"],
  description: "Creates a Database",
  category: 'Dogenomy',
  syntax: 'e.start',
  cooldown: 30,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    
    const player = new db({
      _id: author.id,
      xp: 0,
      startedOn: Date.now()
    });

    await player.save(async e => {
      if (e) {
        message.reply("No u.");
        return;
      } else {
        message.reply(`Created a profile! You got a ${await getEmoji('tracks_black')} black tracks, try \`e.pf\` to view, join community server to get a helmet!`);
      }
    });
  }
};