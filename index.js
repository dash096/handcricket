require('dotenv').config();
const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});
const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
const db = require('./schemas/player.js');

//Get Coins Emoji
async function getEmoji() {
  const emojiGuild = await client.guilds.fetch('823608260166025217');
  const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name === 'cc');
  return emoji;
}
module.exports = getEmoji();


//Ready Event
client.on("ready", async () => {
  console.log("Logged in!");
  client.user.setActivity("HandCricket");

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }

  await mongoose.connect(process.env.MONGO, dbOptions).
  catch (e => {
    if (e) {
      console.log(e);
      return;
    }
  });
  console.log("Mongo Connected", process.env.PRFX);

  const messagesPath = "";
  const disabledDefaultCommands = [];

  new WOKCommands(client,
    {
      commandsDir: "commands",
      messagesPath,
      showWarns: true,
      dbOptions,
      disabledDefaultCommands
    })
  .setMongoPath(process.env.MONGO)
  .setDefaultPrefix(process.env.PRFX)
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
    
    const brokenBoosts = require('./functions/brokenBoosts.js');
    await brokenBoosts();
});

client.login(process.env.TOKEN);
