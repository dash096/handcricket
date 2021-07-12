const db = require('../../schemas/player.js');
const Discord = require('discord.js');
const getErrors = require('../../functions/getErrors.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'rank'],
  description: 'Check the leaderboard of StrikeRate, Wins, Xp and Dogecoins balance',
  category: 'Dogenomy',
  syntax: 'e.leaderboard <strike/wins/coin/xp/orange/highscore/totalscore/wickets>',
  cooldown: 20,
  run: async ({ message, args, client }) => {
    const { guild, content, mentions, channel, author } = message;
    
    let availableTypes = ['strike', 'wins', 'coins', 'xp', 'orange', 'highscore', 'totalscore', 'wickets'];
    let type = args[0];
    
    if(!availableTypes.find(type => type == args[0])) {
      message.reply(getErrors({ error: 'syntax', filePath: 'dogenomy/leaderboard.js'}));
      return;
    }
    
    let datas;
    if (type == 'strike') {
      type = 'strikeRate';
      datas = (await db.find().sort({ strikeRate: -1 })).slice(0, 10);
    } else if (type == 'wins') {
      type = 'wins';
      datas = (await db.find().sort({ wins: -1 })).slice(0, 10);
    } else if (type == 'coins') {
      type = 'cc';
      datas = (await db.find().sort({ cc: -1 })).slice(0, 10);
    } else if (type == 'xp') {
      type = 'xp';
      datas = (await db.find().sort({ xp: -1 })).slice(0, 10);
    } else if (type == 'orange') {
      type = 'orangeCaps';
      datas = (await db.find().sort({ orangeCaps: -1 })).slice(0, 10);
    } else if (type == 'highscore') {
      type = 'highScore';
      datas = (await db.find().sort({ highScore: -1 })).slice(0, 10);
    } else if (type == 'totalscore') {
      type = 'totalScore';
      datas = (await db.find().sort({ totalScore: -1 })).slice(0, 10);
    } else if (type == 'wickets') {
      type = 'wickets';
      datas = (await db.find().sort({ wickets: -1})).slice(0, 10);
    }

    let leaderboardText = await getLeaderboardText(datas, type, args[0]);
    
    let embed = new Discord.MessageEmbed()
      .setTitle(`Global ${args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase()} Leaderboard`)
      .setDescription(leaderboardText)
      .setColor(embedColor)
      .setFooter(`Requested by ${author.username}`);
      
    await message.reply(embed);
    
    async function getLeaderboardText(datas, type, typeArgs) {
      let text = '\n**__💥  Top 10  💥__**\n\n';
      let i = 0;

      while(i < datas.length) {
        try {
          const user = await client.users.fetch(datas[i]._id);
          
          if (i > 2) {
            text += `${getSerialNo(i + 1)}   \`${fixDecimal((datas[i])[type], type)} ${getType(typeArgs)}\`  **${user.username}**\n`;
          } else {
            if(i === 2) {
              text += `${getSerialNo(i + 1)}    **${user.username}**\n         ${fixDecimal((datas[i])[type], type)} ${getType(typeArgs)}\n\n`;
            } else {
              text += `${getSerialNo(i + 1)}    **${user.username}**\n         ${fixDecimal((datas[i])[type], type)} ${getType(typeArgs)}\n`;
            }
          }
          
          i += 1;
          if(i === 10) return text;
        } catch (e) {
          console.log(e);
        }
      }
    }
    
    function getType(type) {
      if (type == 'orange') return 'OrangeCaps'
      else if (type == 'strike') return 'StrikeRate'
      else return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
    
    function fixDecimal(n, type) {
      let split = n.toString().split('.')
      let max = 30;

      let fixedNumber;

      if(split.length == 1) {
        fixedNumber = n;
      } else if (type == 'xp' || type == 'cc') {
        return split[0];
      } else {
        if(type == 'strikeRate') {
          let float = split[1].slice(0, 3);
          if(float.length < 3) {
            for(let i = float.length; i < 3; i++) {
              float += 0;
            }
            fixedNumber = split[0] + '.' + float;
          } else {
            fixedNumber = split[0] + '.' + split[1].slice(0, 3);
          }
        } else {
          fixedNumber = `${split[0]}.${split[1].slice(0, 3)}`;
        }
      }
      return fixedNumber;
    }

    function getSerialNo(i) {
      if(i > 3) return i;
      else {
        if (i === 1) return '🥇';
        else if (i === 2) return '🥈';
        else if (i === 3) return '🥉';
      }
    }
  }
};