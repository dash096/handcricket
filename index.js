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

module.exports = getEmojis;

const topggapi = new Topgg.Api(process.env.TOPGG_TOKEN);

//Ready Event
client.on("ready", async () => {
  console.log("Logged in!");
  
  setInterval(() => {
    topggapi.postStats({
      serverCount: client.guilds.cache.size,
    });
    client.user.setActivity(`Cheems Cricket in ${client.guilds.cache.size} guilds!`);
  }, 60 * 30 * 1000); //30 minutes

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  };
  try {
    await mongoose.connect(process.env.MONGO, dbOptions);
    console.log('Mongo Connected');
    
    const datas = await db.find();
    datas.forEach(async data => {
      const user = await client.users.fetch(data._id);
      const decors = data.decors || {};
      decors.tracks_black = 1;
      await db.findOneAndUpdate({_id: data._id}, {$set: {decors: decors}});
      await user.send(
      'You are given a black tracks to save your dignity when someone sees your profile, Do `e.equip black tracks` to wear it\n' +
      'https://top.gg/bot/804346878027235398/vote vote here when?\n' + 
      'https://bit.ly/dispoGuild Join Official Guild for more decors when?'
      );
    })
    await loadFiles();
  
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
  const listeners = fs.readdirSync('./features');
  for(const listener of listeners) {
    try {
      const feature = require(`./features/${listener}`);
      feature({client, prefix, topggapi});
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