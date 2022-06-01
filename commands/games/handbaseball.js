const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require("../../functions/getErrors.js");
const getTarget = require("../../functions/getTarget.js");
const executeDuoMatch = require("../../baseballFunctions/duoStart.js");
const ServerID = process.env.SERVER;
const gain = require('../../functions/gainExp.js')

module.exports = {
  name: "handbaseball",
  aliases: ["hb", "baseball"],
  description: "Play hand-baseball!",
  category: "Games",
  syntax: "e.handbaseball <@user/userID> [flags]",
  flags: "`--post`: to post progress in channel.",
  status: true,
  cooldown: 10,
  run: async ({ message, args, client, prefix }) => {
    const { content, author, guild, channel, mentions } = message;
    
    if (guild.id !== ServerID) {
      return message.reply('This command is restricted to Community Server only');
    }
    
    //Check Status of the user.
    const user = author;
    
    try {
      //Target Validation
      const target = await getTarget(message, args, client);
      if (!target) return;
      if (user.id === target.id) {
        return message.reply(
          getErrors({ error: "syntax", filePath: "games/handbaseball.js" })
        );
      }
      
      //Change status
      await changeStatus(user, true);
      await changeStatus(target, true);
      
      executeDuoMatch(client, message, user, target)
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
