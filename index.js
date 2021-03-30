require('dotenv').config();
const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});
const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
const db = require('./schemas/player.js');

//Top.gg
const topgg = require('@top-gg/sdk');
const voteAPI = new topgg.Api(process.env.TOP);

module.exports = getEmojis();

//Ready Event
client.on("ready", async () => {
  console.log("Logged in!");
  client.user.setActivity("HandCricket");

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };

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
      featuresDir: "features",
      messagesPath,
      showWarns: true,
      dbOptions,
      disabledDefaultCommands
    })
  .setMongoPath(process.env.MONGO)
  .setDefaultPrefix('e.')
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


//Get Emojis
async function getEmojis() {
  const emojiGuild = await client.guilds.fetch('823608260166025217');
  const coin = emojiGuild.emojis.cache.find(emoji => emoji.name === 'cc');
  const full = emojiGuild.emojis.cache.find(emoji => emoji.name === 'full');
  const half = emojiGuild.emojis.cache.find(emoji => emoji.name === 'half');
  const empty = emojiGuild.emojis.cache.find(emoji => emoji.name === 'empty');
  return [coin, full, half, empty];
}