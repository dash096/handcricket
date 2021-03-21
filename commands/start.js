const db = require("../schemas/player.js");
const Discord = require("discord.js");

module.exports = {
    name: "start",
    aliases: ["play"],
    category: "handcricket",
    description: "Creates a Database",
    run: async({
        message
    }) => {
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