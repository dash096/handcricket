const Discord = require('discord.js');
const db = require('../schemas/player.js');
const getErrors = require('../functions/getErrors.js');
const misc = require('../schemas/misc.js');

module.exports = ({client, prefix}) => {
  client.on('message', async message => {
    const { cooldowns, commands } = client;
    const {
      content, author, channel, mentions, guild
    } = message;
    
    if(content.trim().startsWith(`<@${client.user.id}>`)) {
      message.reply('Oi! My prefix is `e.` Use `e.help` if you want to know more about me :)');
      return;
    }

    if (
      !content.trim().toLowerCase().startsWith(prefix) ||
      author.bot ||
      channel.type === 'dm'
    ) {
      return;
    }
    
    //BlackLists
    let miscBlacklists = (await misc.findOne({ name: 'blacklist' }));
    if(miscBlacklists?.blacklists?.find(user => user === author.id)) return;
    
    const perms = [
    'ADD_REACTIONS',
    'USE_EXTERNAL_EMOJIS',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'SEND_MESSAGES',
    'READ_MESSAGE_HISTORY',
    'MANAGE_MESSAGES'
    ];
    const permsText = "Add Reactions, Use External Emojis, Embed Links, Attach Files, Send Messages, Read Message History, Manage Messages"
    
    for (let perm of perms) {
      let hasPerm = guild.me.permissionsIn(channel).has(perm);
      
      if(hasPerm === false) {
        if (perm === 'SEND_MESSAGES') {
          try {
            await author.send('I do not have send messages perms to execute that command in that channel.');
          } catch(e) {
            return;
          }
        } else {
          message.reply(`I dont have all of my perms in <#${channel.id}>, My required Permissions are:\n` + perms);
          return
        }
      }
    };
    
    const args = content.trim().slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    //Check Aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases?.includes(commandName));
    if (!command) return;
    
    if(command.name == 'handcricket' && (args[0] === 'x' || args[0] === 'end')) {
      return;
    }
    
    //Status
    let commandStatus = command.status || false;
    
    //Check engagement
    const data = await db.findOne({ _id: author.id });
    if (!data && command.name !== 'start') {
      message.reply(getErrors({error: "data", user: author}));
      return
    }
    
    if(
      commandStatus === true &&
      data.status === true
    ) {
      message.reply('You are already engaged in a game');
      return
    }
    
    let targets = mentions.users.values();
    if (targets.length) {
      for(const target of targets) {
        let targetData = await db.findOne({ _id: target.id });
        if(!targetData) {
          message.reply(getErrors({error: "data", user: target}));
          return
        } else if(commandStatus === true && target.status === true) {
          message.reply(`${target.tag} is already engaged in a game`);
          return
        }
      }
    }
    
    //Cooldowns
    if (command.cooldown) {
      if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = command.cooldown * 1000;
      
      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
       
        if (now < expirationTime) {
          let timeLeft = parseInt((expirationTime - now) / 1000);
          let sec = Math.floor(timeLeft%60);
          let min = Math.floor(timeLeft/60);

          sec = `${sec || 1}s`
          min = min ? `${min}m` : ""
          
          message.reply(`Wait for ${min}${sec} before using that command again.`);
          return
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    
    //Run Command
    try {
      command.run({message, args, prefix, client});
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  });
};