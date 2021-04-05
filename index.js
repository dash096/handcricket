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

module.exports = getEmojis();

const listeners = fs.readdirSync('./features');
console.log(`${listeners.length} listeners loaded`);
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
  console.log(`${files.length} ${folder} commands loaded`);
  for(const file of files) {
    try {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.name, command);
    } catch(e) {
      console.log(e);
    }
  }
}

//Ready Event
client.on("ready", async () => {
  console.log("Logged in!");
  client.user.setActivity("HandCricket");
  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  };
  await mongoose.connect(process.env.MONGO, dbOptions).catch (e => {
    console.log(e);
    return;
  });
    
  const brokenBoosts = require('./functions/brokenBoosts.js');
  const brokenQuests = require('./functions/brokenQuests.js');
  await brokenBoosts();
  await brokenQuests();
});

client.login(process.env.TOKEN);

//Get Emojis
async function getEmojis() {
  const emojiGuild = await client.guilds.fetch('828269371699888178');
  const coin = emojiGuild.emojis.cache.find(emoji => emoji.name === 'cc');
  const full = emojiGuild.emojis.cache.find(emoji => emoji.name === 'full');
  const half = emojiGuild.emojis.cache.find(emoji => emoji.name === 'half');
  const empty = emojiGuild.emojis.cache.find(emoji => emoji.name === 'empty');
  const pixel = emojiGuild.emojis.cache.find(emoji => emoji.name === 'PixelHeart');
  const ok = emojiGuild.emojis.cache.find(emoji => emoji.name === 'ok');
  const no = emojiGuild.emojis.cache.find(emoji => emoji.name === 'no');
  return [coin, full, half, empty, pixel, ok, no];
}