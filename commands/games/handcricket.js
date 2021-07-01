const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require("../../functions/getErrors.js");
const getTarget = require("../../functions/getTarget.js");
const executeTeamMatch = require("../../cricketFunctions/teamMatch.js");
const executeDuoMatch = require("../../cricketFunctions/duoMatch.js");
const duoInnings = require('../../cricketFunctions/duoInnings.js')
const getChallenge = require('../../cricketFunctions/getChallenges.js')
const ServerID = process.env.SERVERID

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket"],
  description: "Play handcricket!",
  category: "Games",
  syntax: "e.handcricket <@user/userID/solo/map/team> [flags]",
  flags: "`--post`: to post progress in the channel, for duos\n`--wickets <number>`: to set wickets\n`--overs <number>`: to set overs\n`--noc`: To play a non-challenging solo match.",
  status: true,
  cooldown: 10,
  run: async ({ message, args, client, prefix }) => {
    const { content, author, guild, channel, mentions } = message;
    for (let i in args) args[i] = args[i].toLowerCase()
    
    //Check Status of the user.
    const user = author;
    const userData = await db.findOne({
      _id: user.id,
    });

    //Check Status
    if (userData.status === true) {
      message.reply(getErrors({ error: 'engaged', user }));
      return;
    }

    let soloAliases = ['solo', 'cpu', 'single', 1]
    
    try {
      //Team Match
      if (args[0] == "team") {
        executeTeamMatch(message, client);
      } //Solo Map
      else if (args[0] == "map") {
        let progress = (userData.challengeProgress || 'classic_0').split('_')
        let mode = progress[0]
        let num = progress[1]
        
        let embed = new Discord.MessageEmbed()
            .setTitle(`**${user.username}** Solo Map`)
            .attachFiles(`./assets/map_${mode}.jpg`)
            .setImage(`attachment://map_${mode}.jpg`)
            .setFooter(`You have made your way to "${num}"\n Use the command "e.hc solo" to the next adventure.`)
        await message.reply({ embed: embed })
      } //Solo Match
      else if (args[0] == 'solo') {
        message.author = await client.users.fetch(author.id)
        
        if (message.guild.id !== ServerID) {
          return await message.reply('Beta feature, Challenges only available in Official Server.')
        }
        
        let flags = {
          wickets: 1,
          overs: 5,
        }
        
        try {
          if (content.toLowerCase().includes('--wickets')) {
            let wickets = content[(/--wickets/.exec(content)).index + 11];
            if (!wickets || isNaN(wickets)) {
              message.reply('Invalid Value for Flag Wickets and it is set to 1 as default.');
            } else if (wickets > 5) {
              flags.wickets = 5;
              message.reply('Limited wickets for a duoMatch is 1-5, it is now set to 5');
            } else {
              flags.wickets = parseInt(wickets) || 1;
            }
          }
          if (content.toLowerCase().includes('--overs')) {
            let overs = content[(/--overs/.exec(content)).index + 9];
            if (!overs || isNaN(overs)) {
              message.reply('Invalid Value for Flag Overs and it is set to 5 as default.');
            } else if (overs > 5) {
              flags.overs = 5;
              message.reply('Limited overs for a duoMatch is 1-5, it is now set to 5');
            } else {
              flags.overs = parseInt(overs) || 5;
            }
          }
          let challenge = await getChallenge(
            message,
            content.toLowerCase().includes('--noc') ? 'noChallenge' :
            userData.challengeProgress ? userData.challengeProgress :
            'classic_0',
            flags,
          )
          
          if (!challenge) {
            throw 'Oof, You crossed the Classic mode already, Next mode is **Coming soon!**'
          } else if (challenge.name !== 'noChallenge' && userData.stamina < 2) {
            throw 'Oof, You have insufficient stamina.'
          }
          
          challenge.player.data = userData
          challenge.player.pattern = userData.pattern
          challenge.player.pattern = Object.entries(challenge.player.pattern).sort((a, b) => b[1] - a[1])
          challenge.player.pattern = challenge.player.pattern.map(x => x[0])
          
          await channel.send(`get to DMs.`)
          
          // Change Status
          await changeStatus(user, true, -2);
          
          await duoInnings(challenge.player, challenge.CPU, message, { max: 6, post: false }, challenge)
        } catch(e) {
          console.log(e)
          await message.reply(e)
        }
      } //Duo Match
      else {
        //Target Validation
        const target = await getTarget(message, args, client);
        if (!target) return;
        if (user.id === target.id) {
          return message.reply(
            getErrors({ error: "syntax", filePath: "games/handcricket.js" })
          );
        }
        //Status Validation
        const targetData = await db.findOne({ _id: target.id });
        if (targetData.status === true) {
          message.reply(getErrors({ error: "engaged", user: target }));
          return;
        }

        //Change status
        await changeStatus(user, true);
        await changeStatus(target, true);
        executeDuoMatch(message, user, target);
      }
    } catch (e) {
      console.log(e);
      return;
    }
  },
};

async function changeStatus(a, boolean, changeStamina) {
  if (boolean !== true && boolean !== false) return;
  
  let update = {
    '$set': {
      'status': boolean,
    },
  }
  
  if (changeStamina) {
    update['$inc'] = {
      'stamina': changeStamina 
    }
  }
  
  await db.findOneAndUpdate({ _id: a.id }, update);
}
