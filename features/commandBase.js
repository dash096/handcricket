const Discord = require('discord.js');
const db = require('../schemas/player.js');
const getErrors = require('../functions/getErrors.js');

module.exports = (client, prefix) => {
  client.on('message', async message => {
    const { cooldowns, commands } = client;
    const {
      content, author, channel, mentions
    } = message;
    
    if (!content.toLowerCase().startsWith(prefix) || author.bot || channel.type === 'dm') return;

    //Check engagement
    const data = await db.findOne({
      _id: author.id
    });
    if (!data) return message.reply(getErrors('data', author));
    if (data.status === true) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    //Check Aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
        if (timeLeft >= 60) {
          min = (timeLeft/60).toFixed(0) + 'm';
          sec = (timeLeft % 60) + 's';
          if (sec == '0s') sec = '';
        } else sec = timeLeft.toFixed(0);
        if (!min) min = '';
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
};