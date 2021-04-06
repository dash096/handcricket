require('dotenv').config();
const fs = require('fs');
const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
const WOKCommands = require("wokcommands");
const mongoose = require("mongoose");
const db = require('./schemas/player.js');
const prefix = 'e.';
const { commands, cooldowns } = client;

module.exports = getEmojis;

//Ready Event
client.on("ready", async () => {
  console.log("Logged in!");
  client.user.setActivity("Cricket");
  
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  };
  try {
    await mongoose.connect(process.env.MONGO, dbOptions);
    console.log('Mongo Connected');
  
    await loadFiles();
  
    let loadFunctions = ['brokenQuests.js', 'brokenBoosts.js'];
    for(const loadFunction of loadFunctions) {
      const execute = require(`./functions/${loadFunction}`);
      execute(client, prefix);
    }
  } catch (e) {
    return console.log(e);
  }
});

function loadFiles() {
  const listeners = fs.readdirSync('./features');
  for(const listener of listeners) {
    try {
      const feature = require(`./features/${listener}`);
      feature(client, prefix);
    } catch (e) {
      console.error(e);
    }
  }

  const folders = fs.readdirSync('./commands').filter(folder => !folder.includes('.'));
  for(const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`);
    for(const file of files) {
      try {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
      } catch(e) {
        console.log(e);
      }
    }
  }
  console.log(`${listeners.length} listeners loaded`);
  console.log(`${client.commands.size} commands loaded`);
}

client.login(process.env.TOKEN);

//Get Emojis
async function getEmojis(name) {
  const emojiGuild = await client.guilds.fetch('828269371699888178');
  const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
  return emoji;
}