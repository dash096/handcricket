const Discord = require("discord.js");

const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
require("dotenv").config();

async function getEmoji() {
  const emojiGuild = await client.guilds.fetch('823608260166025217');
  const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name === 'cc');
  return emoji;
}
module.exports = getEmoji();

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
  }).
  catch (e => {
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

client.on('message', async m => {
  const db = require('./schemas/items.js');
  
  const args = m.content.toLowerCase().trim().split(' ').slice(1);
  
  if(m.content.startsWith('i+')) {
    
    const newitem = new db({
      id: args[0],
      name: args[1],
      description: args.slice(2).join(' ')
    });
    
    db.save((e) => {
      if(e) {
        console.log(e);
        return;
      }
      console.log(newitem);
    })
  }
  
});

client.login(process.env.TOKEN);