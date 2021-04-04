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

const folders = fs.readdirSync('./commands').filter(folder => !folder.includes('.'));
for(const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`);
  for(const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
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
  await brokenBoosts();
});

client.on('message', message => {
  if(!message.content.toLowerCase().startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  //Check Aliases
  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
	
	//Check Perms
	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('Missing perms. Sus!');
		}
	}

  //Cooldowns
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
   if (now < expirationTime) {
			let timeLeft = (expirationTime - now) / 1000;
			let sec;
			let min;
			if(timeLeft >= 60) {
			  min = (timeLeft/60).toFixed(0) + 'm';
			  sec = (timeLeft % 60) + 's';
			  if(sec = '0s') sec = '';
			} else sec = timeLeft.toFixed(0);
			if(!min) min = '';
			return message.reply(`Wait for ${min} ${sec} before spamming that command again.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  //Run Command
	try {
		command.run(message, args.slice(1), prefix, client);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

const listeners = fs.readdirSync('./features');
for(const listener of listeners) {
  const feature = require(`./features/${listener}`);
  feature(client, prefix);
}
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