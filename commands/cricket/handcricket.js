const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../../functions/getErrors.js');
const getTarget = require('../../functions/getTarget.js');
const firstInnings = require("../../functions/innings1.js");
const executeTeamMatch = require("../../functions/teamMatch.js");
const executeSoloMatch = require("../../functions/soloMatch.js");

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket", "play"],
  description: "Play handcricket with a user",
  category: 'Cricket',
  syntax: 'e.handcricket @user --post (to post scores in channel)',
  status: true,
  cooldown: 10,
  run: async ({message, args, client}) => {
    const { content, author, channel, mentions } = message;
    
    try {
      //Team Match
      if(args.join(' ').trim().toLowerCase().includes('team')) {
        executeTeamMatch(message);
      } else { //Solo Match
        const user = author;
        const target = getTarget(message, args, client);
        if(!target) return;
        if(user.id === target.id) return message.reply('Play with yourself? Silly');
    
        const userdata = await db.findOne({
          _id: user.id
        });
        const targetdata = await db.findOne({
          _id: target.id
        });
    
        if(userdata.status === true) {
          message.reply(`${user.tag} is already engaged in a game`);
          return;
        } else if(targetdata.status === true) {
          message.reply(`${target.tag} is already engaged in a game`);
          return;
        }
        //Change status to avoid 2 matchs at same time
        await changeStatus(user, true);
        await changeStatus(target, true);
        executeSoloMatch(message, user, target);
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }
};
 
async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}