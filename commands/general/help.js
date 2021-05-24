const fs = require('fs');
const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'help',
  description: 'Get help!',
  category: 'General',
  syntax: 'e.help',
  run: async ({message, args, prefix}) => {
    const { content, author, channel, mentions } = message;
    
    try {
      const commands = await getCommands();
      const general = commands[0];
      const cricket = commands[1];
      const minigames = commands[2];
      
      const send = new Discord.MessageEmbed()
        .setTitle('Help')
        .setDescription('Here\'s an Interactive GUIDE for you!\n\n')
        .addField('Navigate via the pages of the guide by appending the number next to ' + `${prefix}help`, 
          '1) ❓ - **__About and Guide__**\n2) 👀 - **__General Conmands__**\n3) 🏏 - **__Cricket Commands__**\n4) 🎮 - **__Minigames Commands__**')
        .addField('Links', '[Add the bot](https://bit.ly/dispoBot)\n[Vote me](https://top.gg/bot/804346878027235398/vote)\n[Support Server](https://bit.ly/dispoGuild)')
        .setColor(embedColor)
        .attachFiles('./assets/banner.jpg')
        .setImage('attachment://banner.jpg')
        .setFooter('Requested by ' + author.tag);
      
      const helpEmbed = await channel.send('Loading...');
      await helpEmbed.react('❓');
      await helpEmbed.react('👀');
      await helpEmbed.react('🏏');
      await helpEmbed.react('🎮');
      await helpEmbed.react('❌');
      await helpEmbed.edit(null, { embed: send });
      
      checkReaction();
      function checkReaction() {
        helpEmbed.awaitReactions(
          (reaction, user) => user.id == author.id,
          {
            time: 40000,
            max: 1,
            errors: ['time'],
          }
        ).then(async (collected) => {
          const reaction = Array.from(collected.keys()) [0];
          
          if(reaction == '❓') {
            helpEmbed.edit(getEmbed('about'));
            return checkReaction();
          } else if (reaction == '👀') {
            helpEmbed.edit(getEmbed('general'));
            return checkReaction();
          } else if (reaction == '🏏') {
            helpEmbed.edit(getEmbed('cricket'));
            return checkReaction();
          } else if (reaction == '🎮') {
            helpEmbed.edit(getEmbed('minigames'));
            return checkReaction();
          } else {
            helpEmbed.delete();
          }
          
        }).catch(e => {
          console.log(e);
        });
      }
      
      function getEmbed(name) {
        const aboutEmbed = new Discord.MessageEmbed()
          .setTitle('About Cricket')
          .setDescription('Not actually cricket, but **__handcricket__**. A popular kiddo game originated in **South India** and spread to whole India')
          .addField('How to Play?', 'Once when you start a match, get to dms to play. It is played in dms cause the numbers are supposed to be hidden...\n\n' +
            'The bowler bowls a ball by typing a number , the batsman  hits the ball by typing a number. If both the numbers are same, it is a Wicket and the batsman changes else the batsman\'s number adds to his score, and after wicket, the next innings starts with a target that the previous batsman has hit in total\n\n' +
            'The batsman and bowler in first innings gets swapped their position. Now the batsman(i.e the bowler in innings 1) has to chase the bowler\'s(i.e. batsman in innings 1) score\n\n' +
            'If the batsman and the bowler type the same number before the score is reached, bolwer wins, else if the batsman crosses the target, batsman wins.')
          .setColor(embedColor)
          .setFooter('Requested by ' + author.username);
        const generalEmbed = new Discord.MessageEmbed()
          .setTitle('General Commands')
          .setDescription(general)
          .setColor(embedColor)
          .setFooter('Requested by ' + author.username);
        const cricketEmbed = new Discord.MessageEmbed()
          .setTitle('Cricket Commands')
          .setDescription(cricket)
          .setColor(embedColor)
          .setFooter('Requested by ' + author.username);
        const minigamesEmbed = new Discord.MessageEmbed()
          .setTitle('Minigames Commands')
          .setDescription(minigames)
          .setColor(embedColor)
          .setFooter('Requested by ' + author.username);
        
        if(name == 'about') return aboutEmbed;
        else if(name == 'general') return generalEmbed;
        else if(name == 'cricket') return cricketEmbed;
        else return minigamesEmbed;
      }
    } catch (e) {
      console.log(e);
    }
  }
};

function getCommands() {
  let General = '';
  let Cricket = '';
  let Minigames = '';
  const folders = fs.readdirSync('./commands');
  for(const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`);
    for(const file of files) {
      const command = require(`../${folder}/${file}`);
      if(folder.toLowerCase() == 'cricket') {
        Cricket += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      } else if (folder.toLowerCase() == 'general') {
        General += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      } else if (folder.toLowerCase() == 'minigames') {
        Minigames += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      }
    }
  }
  return [
    General, Cricket, Minigames
  ];
}