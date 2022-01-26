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
    
    if (
      !content.toLowerCase().startsWith(prefix) ||
      author.bot ||
      channel.type === 'dm'
    ) {
      if(!content.trim().startsWith(`<@${client.user.id}>`)) return;
    }
    
    if(content.trim().startsWith(`<@${client.user.id}>`)) {
      message.reply('Oi! My prefix is `e.` Use `e.help` if you want to know more about me :)');
      return;
    }
    
    //BlackLists
    let miscBlacklists = (await misc.findOne({ name: 'blacklist' }));
    if(miscBlacklists && miscBlacklists.blacklists.find(user => user === author.id)) return;
    
    const perms = [
    'ADD_REACTIONS',
    'USE_EXTERNAL_EMOJIS',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'SEND_MESSAGES',
    'READ_MESSAGE_HISTORY',
    'MANAGE_MESSAGES'
    ];
    
    for (let perm in perms) {
      perm = perms[perm];
      
      let hasPerm = guild.me.permissionsIn(channel).has(perm);
      if(hasPerm === false && perm === 'SEND_MESSAGES') {
        try {
          await author.send('I do not have send messages perms to execute that command in that channel.');
        } catch(e) {
          return;
        }
        return;
      } else if(hasPerm === false) {
        function getPerms() {
          let text = '';
          perms.forEach(perm => {
            let arr = perm.split('_');
            let word1 = arr[0].charAt(0).toUpperCase() + arr[0].slice(1).toLowerCase();
            let word2 = arr[1].charAt(0).toUpperCase() + arr[1].slice(1).toLowerCase();
            if(arr[2]) word2 += ` ${arr[2].charAt(0).toUpperCase() + arr[2].slice(1).toLowerCase()}`;
            
            text += `\`${word1} ${word2}\`${perms.indexOf(perm) === perm.length - 1 ? `,` : "" }`;
          });
          return text;
        }
        return message.reply(`I dont have all of my perms in <#${channel.id}>, My required Permissions are:\n` + getPerms());
      }
    };
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    //Check Aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    
    if(command.name == 'handcricket' && (args[0] === 'x' || args[0] === 'end')) {
      return;
    }
    
    //Status
    let commandStatus = command.status || false;
    
    //Check engagement
    const data = await db.findOne({ _id: author.id });
    if (!data && command.name !== 'start') {
      let user = author;
      let error = 'data';
      return message.reply(getErrors({error, user}));
    }
    
    if(
      commandStatus === true &&
      data.status === true &&
      command.name != 'help'
    ) {
      return message.reply('You are already engaged in a game');
    }
    
    let targets = mentions.users;
    targets = targets.values();
    if (targets || targets.length !== 0) {
      for(const target of targets) {
        let targetData = await db.findOne({ _id: target.id });
        if(!targetData) {
          let error = 'data';
          let user = target;
          return message.reply(getErrors({error, user}));
        } else if(commandStatus === true && target.status === true) {
          return message.reply(`${target.tag} is already engaged in a game`);
        }
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
        let timeLeft = parseInt((expirationTime - now) / 1000);
        let sec;
        let min;
        if (timeLeft >= 60) {
          min = (timeLeft/60).toFixed(0) + 'm';
          sec = ` ${timeLeft % 60}s`;
          if (sec === ' 0s') sec = '';
        } else sec = `${timeLeft}s`;
        if (!min) min = '';
        return message.reply(`Wait for ${min}${sec} before using that command again.`);
      }
    }
    if(command.cooldowm) {
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