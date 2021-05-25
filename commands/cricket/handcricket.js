const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require("../../functions/getErrors.js");
const getTarget = require("../../functions/getTarget.js");
const firstInnings = require("../../functions/duoInnings1.js");
const executeTeamMatch = require("../../functions/teamMatch.js");
const executeDuoMatch = require("../../functions/duoMatch.js");

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket", "play"],
  description: "Play handcricket with a user",
  category: "Cricket",
  syntax: "e.handcricket @user --post (to post scores in channel)",
  status: true,
  cooldown: 10,
  run: async ({ message, args, client, prefix }) => {
    const { content, author, guild, channel, mentions } = message;

    //Check Status of the user.
    const user = author;
    const userdata = await db.findOne({
      _id: user.id,
    });

    if (
      content.toLowerCase().trim() == "e.hc end" ||
      content.toLowerCase().trim() == "e.hc x"
    ) return;

    if (userdata.status === true) {
      message.reply(getErrors({ error: 'engaged', user }));
      return;
    }

    try {
      //Team Match
      if (args.join(" ").trim().toLowerCase().includes("team")) {
        executeTeamMatch(message, client);
      } else {
        //Solo Match
        //Target Validation
        const target = await getTarget(message, args, client);
        if (!target) return;
        if (user.id === target.id) {
          return message.reply(
            getErrors({ error: "syntax", filePath: "cricket/handcricket.js" })
          );
        }
        //Status Validation
        const targetdata = await db.findOne({ _id: target.id });
        if (targetdata.status === true) {
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
  await db.findOneAndUpdate({ _id: a.id }, { $set: { status: boolean } });
}
