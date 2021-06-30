const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require("../../functions/getErrors.js");
const getTarget = require("../../functions/getTarget.js");
const executeTeamMatch = require("../../cricketFunctions/teamMatch.js");
const executeDuoMatch = require("../../cricketFunctions/duoMatch.js");

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket"],
  description: "Play handcricket!",
  category: "Games",
  syntax: "e.handcricket <@user/userID/solo/map/team> [flags]",
  flags: "`--post`: to post progress in the channel, for duos\n`--wickets <number>`: to set wickets\n`--overs <number>`: to set overs",
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
      if (args[0] == "map") {
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
      if (args[0] == 'solo') {
        
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

async function changeStatus(a, boolean) {
  if (boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({ _id: a.id }, {
    $set: {
      status: boolean,
    }
  });
}
