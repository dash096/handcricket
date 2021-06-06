require('./extendedMessage.js');
require('dotenv').config();
const fs = require('fs');
const mongoose = require("mongoose");
const db = require('./schemas/player.js');
const Topgg = require('@top-gg/sdk');
const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const prefix = 'e.';
const { commands, cooldowns } = client;
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const topggapi = new Topgg.Api(process.env.TOPGG_AUTH);

/* Export GETEMOJI */
module.exports = getEmojis;

/* Bot READY EVENT */
client.on("ready", async () => {
  
  try {
    console.log("Logged in as ", client.user.username);
   
    /* Post Stats to TOPGG */
    setInterval(() => {
      topggapi.postStats({
        serverCount: client.guilds.cache.size,
      });
      client.user.setActivity(`Dispo in ${client.guilds.cache.size} guilds!`);
    }, 60 * 30 * 1000); //30 minutes
    
    /* Connect to DATABASE */
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('Mongo Connected');
    
    /* Log Total GUILDS and PLAYERS */
    console.log(`Total ${client.guilds.cache.size} Servers and ${(await db.find()).length} users have a profile.`);
    
    /* Load COMMANDS and LISTENERS */
    await loadFiles();
    
    /* Fix BROKEN TIMERS */
    let loadFunctions = fs.readdirSync('./functions').filter(file => file.startsWith('broke'));
    for(const loadFunction of loadFunctions) {
      const execute = require(`./functions/${loadFunction}`);
      execute({client, prefix, topggapi});
    }
  } catch (e) {
    console.log(e);
    return;
  }
});

function loadFiles() {
  
  /* Load LISTENERS */
  const listeners = fs.readdirSync('./features');
  for(const listener of listeners) {
    try {
      const feature = require(`./features/${listener}`);
      feature({client, prefix, topggapi});
    } catch (e) {
      console.error(e);
    }
  }
  
  /* Load COMMAND CATEGORIES and COMMANDS */
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

//Functiom to FETCH EMOJIS
async function getEmojis(name) {
  const emojiGuild = await client.guilds.fetch('828269371699888178');
  const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
  return emoji;
}
