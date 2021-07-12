const fs = require('fs');
const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'help',
  aliases: ['halp'],
  description: 'Get help!',
  category: 'General',
  syntax: 'e.help [name]',
  run: async ({message, args, prefix}) => {
    const { content, author, member, channel, mentions } = message;
    const commands = await getCommands();
    
    if (args.length > 0) {
      let cmds = commands [4]
      let queryWords = args.map(x => x.toLowerCase())
      let query = args.join('').toLowerCase()
      
      if(query.length < 9) {
        let cmd = cmds.find(x => x.name == query || x.aliases?.includes(query))
        if (cmd) {
          const send = new Discord.MessageEmbed()
            .setTitle(`${cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1)} Command`)
            .setDescription([cmd.description, cmd.flags || ''].join('\n\n'))
            .addField('Syntax',cmd.syntax) 
            .addField('Cooldown', cmd.cooldown + 's')
            .setFooter('Requested by ' + member.displayName)
            .setColor(embedColor)
          return await message.reply(embed)
        }
      } else {
        let possible = cmds.filter(cmd => {
          if(
            cmd.description.includes(query) ||
            queryWords.find(q =>
              cmd.syntax.includes(q) ||
              cmd.flags?.includes(q) ||
              cmd.subcommands?.includes(q)
            )
          ) {
            return true
          } else {
            let counter = 0
            let chaos = [
              cmd.description,
              cmd.syntax,
              cmd.flags || cmd.subcommands || '',
              cmd.aliases.join('')
            ].join('')
            for (let x in query) {
              if (chaos.includes(x)) counter += 1
            }
            if (query.length/2 <= counter) {
              return true
            }
          }
        })
        
        let embed = new Discord.MessageEmbed()
          .setTitle('Matching Results')
          .setFooter(`Requested by ${member.displayName}`)
          .setColor(embedColor)
        if (possible.length > 0) {
          let text = ''
          for (let x in possible) {
            text += `**${x.cmd}** \`${cmd.syntax}\`\n${cmd.description}\n\n`
          }
          embed.setDescription(text)
          await message.reply(embed)
        } else {
          await message.reply('No results')
        }
      }
    }
    
    try {
      const general = commands[0];
      const dogenomy = commands[1];
      const games = commands[2];
      const minigames = commands[3];
      
      const send = new Discord.MessageEmbed()
        .setTitle('Help')
        .setDescription('**__The prefix is `e.` forever and ever!__**\n\nHere\'s an Interactive GUIDE for you!\n\n')
        .addField('Navigate via the pages of the guide by Reacting', 
          '1) 🏏 - **__Cricket Info__**\n2) ⚽ - **__Football Info__**\n3) ⚾ - **__Baseball Info__**\n4) 👀 - **__General Conmands__**\n5) 💰 - **__Dogenomy Commands__**\n6) 🔫 - **__Games Commands__**\n7) 🎲 - **__MiniGames Commands__**')
        .addField('Links', `[Add the bot](${process.env.INVITE_URL})\n[Support Server](${process.env.COMMUNITY_URL})`)
        .setFooter('Requested by ' + member.displayName)
        .setColor(embedColor);
      
      const helpEmbed = await channel.send(send);
      checkReaction();
      await helpEmbed.react('🏏');
      await helpEmbed.react('⚽');
      await helpEmbed.react('⚾');
      await helpEmbed.react('👀');
      await helpEmbed.react('💰');
      await helpEmbed.react('🔫');
      await helpEmbed.react('🎲');
      await helpEmbed.react('❌');
      
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
          
          if(reaction == '🏏') {
            helpEmbed.edit(getEmbed('cricket'));
            return checkReaction();
          } else if (reaction == '⚽') {
            helpEmbed.edit(getEmbed('football'));
            return checkReaction();
          } else if (reaction == '⚾') {
            helpEmbed.edit(getEmbed('baseball'));
            return checkReaction();
          } else if (reaction == '👀') {
            helpEmbed.edit(getEmbed('general'));
            return checkReaction();
          } else if (reaction == '💰') {
            helpEmbed.edit(getEmbed('dogenomy'));
            return checkReaction();
          } else if (reaction == '🔫') {
            helpEmbed.edit(getEmbed('games'));
            return checkReaction();
          } else if (reaction == '🎲') {
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
        const cricketEmbed = new Discord.MessageEmbed()
          .setTitle('About Cricket')
          .setDescription('Cheems cant afford a bat, so ye he plays with hand.')
          .addField('Gameplay',
            'Once when you start a match, get to dms to play. It is played in dms cause the numbers are supposed to be hidden...\n\n' +
            'The bowler bowls a ball by typing a number , the batsman  hits the ball by typing a number. If both the numbers are same, it is a Wicket and the batsman changes else the batsman\'s number adds to his score, and after wicket, the next innings starts with a target that the previous batsman has hit in total\n\n' +
            'The batsman and bowler in first innings gets swapped their position. Now the batsman(i.e the bowler in innings 1) has to chase the bowler\'s(i.e. batsman in innings 1) score\n\n' +
            'If the batsman and the bowler type the same number before the score is reached, bolwer wins, else if the batsman crosses the target, batsman wins.'
          )
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const footballEmbed = new Discord.MessageEmbed()
          .setTitle('About Football')
          .setDescription('Cheems can\'t run all over the pitch so he likes taking penalties.')
          .addField('Gameplay',
            'As the name states it\'s a best of 5 penalty shootout. Tap the reactions to determine the trajectory of the ball . If same direction then the ball is saved if different direction then its a goal.\n' +
            'To keep things fair if all 5 goals on either side are scored then the game becomes a sudden death match. The person who misses the next goal loses the game.'
          )
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const baseballEmbed = new Discord.MessageEmbed()
          .setTitle('About Baseball')
          .setDescription('Cheems was bored by the normal play, here\'s a modified version.')
          .addField('Gameplay',
            'The toss is done and the pitcher and Striker are selected.\n' +
            'Baseball is played with strikes so if the pitcher and the striker put numbers which are consecutive to each other then it is considered a strike.\n' +
            'If the number is non consecutive then the score is added to the tally.\n' +
            'If the same number is put by both pitcher and Striker , a home run is hit and the score is doubled.\n' +
            'The pitcher needs to get the strikes thrice in total which results in an out.\n' +
            'There is another mechanism to this called the "Run".\n' +
            'If the striker feels that they can hit the ball such a way that it is not a strike or a homerun then they have to type the number and react to the prompt. Not reacting will not activate the run\n' +
            'This adds the run counter and once the run counter reaches 4 a bonus 10 runs are added to the score.\n'
          )
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const generalEmbed = new Discord.MessageEmbed()
          .setTitle('General Commands')
          .setDescription(general)
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const dogenomyEmbed = new Discord.MessageEmbed()
          .setTitle('Dogenomy Commands')
          .setDescription(dogenomy)
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const gamesEmbed = new Discord.MessageEmbed()
          .setTitle('Games Commands')
          .setDescription(games)
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        const minigamesEmbed = new Discord.MessageEmbed()
          .setTitle('Minigames Commands')
          .setDescription(minigames)
          .setColor(embedColor)
          .setFooter('Requested by ' + member.displayName);
        
        if(name == 'cricket') return cricketEmbed;
        else if(name == 'football') return footballEmbed;
        else if(name == 'baseball') return baseballEmbed;
        else if(name == 'general') return generalEmbed;
        else if(name == 'dogenomy') return dogenomyEmbed;
        else if(name == 'games') return gamesEmbed;
        else return minigamesEmbed;
      }
    } catch (e) {
      console.log(e);
    }
  }
};

function getCommands() {
  let general = '';
  let dogenomy = '';
  let games = '';
  let minigames = '';
  
  const commands = [];
  
  const folders = fs.readdirSync('./commands');
  for(const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`);
    for(const file of files) {
      const command = require(`../${folder}/${file}`);
      commands.push(command)
      if(folder.toLowerCase() == 'games') {
        games += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n**Flags**\n${command.flags ? command.flags : 'None'}\n\n`;
      } else if (folder.toLowerCase() == 'general') {
        general += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      } else if (folder.toLowerCase() == 'dogenomy') {
        dogenomy += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      } else if (folder.toLowerCase() == 'minigames') {
        minigames += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      }
    }
  }
  return [
    general, dogenomy, games, minigames, commands
  ];
}