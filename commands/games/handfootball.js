const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require("../../functions/getErrors.js");
const getTarget = require("../../functions/getTarget.js");
const executeDuoMatch = require("../../footballFunctions/duoStart.js");
const ServerID = process.env.SERVER_ID;

module.exports = {
  name: "handfootball",
  aliases: ["hf", "football", "soccer"],
  description: "Play handfootball!",
  category: "Games",
  syntax: "e.handfootball @user --post (to post progress in channel)",
  status: true,
  cooldown: 10,
  run: async ({ message, args, client, prefix }) => {
    const { content, author, guild, channel, mentions } = message;

    if(guild.id !== ServerID) {
      message.reply('That command is restricted only to OS (e.invite) untill the command is fully developed.');
      return;
    }

    //Check Status of the user.
    const user = author;
    const userdata = await db.findOne({
      _id: user.id,
    });

    if (userdata.status === true) {
      message.reply(getErrors({ error: 'engaged', user }));
      return;
    }

    try {
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
      
      let post;
      if(content.toLowerCase().includes('post')) post = true;
      executeDuoMatch(client, message, user, target, post)
    } catch (e) {
      console.log(e);
      return;
    }
  },
};

async function changeStatus(a, boolean) {
  if (boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({ _id: a.id }, { $set: { status: boolean } });
}
