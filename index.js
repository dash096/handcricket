const Discord = require("discord.js");

const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
require("dotenv").config();

const emojiGuild = client.guilds.fetch('823608260166025217');
const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name === 'cc');
console.log(emoji);
module.exports = emoji;

client.on("ready", () => {
  console.log("Logged in!");
  client.user.setActivity("HandCricket");

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }

  mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }).catch (e => {
    if (e) {
      console.log(e);
    }
    console.log("Mongo Connected");
  });

  const messagesPath = "";

  const disabledDefaultCommands = [];

  new WOKCommands(client,
    {
      commandsDir: "commands",
      featureDir: "features",
      messagesPath,
      showWarns: true,
      dbOptions,
      disabledDefaultCommands
    })
  .setMongoPath(process.env.MONGO)
  .setDefaultPrefix("!")
  .setBotOwner("772368021821718549")
  .setColor('#2d61b5')
  .setCategorySettings([{
    name: "general",
    emoji: "👀"
  },
    {
      name: "handcricket",
      emoji: "🏏"
    }]);

});

client.login(process.env.TOKEN);