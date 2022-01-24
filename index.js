require('./extendedMessage.js');
const config = require("./config.json");
const fs = require('fs');
const mongoose = require("mongoose");
const db = require('./schemas/player.js');
const Discord = require("discord.js");

if (!fs.readdirSync("./").includes("config.json")) require("dotenv").config()

const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const prefix = 'e.';
const { commands, cooldowns } = client;
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

module.exports = client;

client.on("ready", async () => {
  try {
    console.log("Logged in as ", client.user.username);
    
    await mongoose.connect(process.env.MONGO || config.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('Mongo Connected');
    
    console.log(`Total ${client.guilds.cache.size} Servers and ${(await db.find()).length} users have a profile.`);
    
    const leaveUnorganic = require('./functions/leaveUnorganic.js')
    Array.from(client.guilds.cache).forEach(async guild => {
      await leaveUnorganic(client, guild[1])
    });
    
    await loadFiles();
    
    let loadFunctions = fs.readdirSync('./functions').filter(file => file.startsWith('broke'));
    for (const loadFunction of loadFunctions) {
      const execute = require(`./functions/${loadFunction}`);
      execute({client, prefix});
    }
  } catch (e) {
    console.error(e);
    return;
  }
});

function loadFiles() {
  const listeners = fs.readdirSync('./features');
  for(const listener of listeners) {
    try {
      const feature = require(`./features/${listener}`);
      feature({ client, prefix });
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
        console.error(e);
      }
    }
  }
  console.log(`${listeners.length} listeners loaded`);
  console.log(`${client.commands.size} commands loaded`);
}

client.login(process.env.TOKEN || config.TOKEN);
