const Discord = require("discord.js");
const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
require("dotenv").config();

const client = new Discord.Client({
  partials: ['MESSAGE', 'REACTION']
});

const emoji = client.emojis.cache.get('823608412360146964');
module.exports = emoji;

client.on("ready", () => {
  console.log("Logged in!" + emoji);
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