const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../../functions/getErrors.js');
const getTarget = require('../../functions/getTarget.js');
const firstInnings = require("../../functions/duoInnings1.js");
const executeTeamMatch = require("../../functions/teamMatch.js");
const executeSoloMatch = require("../../functions/duoMatch.js");

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
    
    //Check Status of the user.
    const user = author;
    const userdata = await db.findOne({
      _id: user.id
    });
    if(userdata.status === true) {
      let error = 'engaged';
      message.reply(getErrors({error, user}));
      return;
    }
    
    try {
      //Team Match
      if(args.join(' ').trim().toLowerCase().includes('team')) {
        executeTeamMatch(message, client);
      } else { //Solo Match
        
        //Target Validation
        const target = getTarget(message, args, client);
        if(!target || user.id === target.id) {
          let error = 'syntax'; let filePath = 'cricket/handcricket.js';
          message.reply(getErrors({error, filePath}));
          return;
        }
        
        //Status Validation
        const targetdata = await db.findOne({
          _id: target.id
        });
        if(targetdata.status === true) {
          let error = 'engaged';
          message.reply(getErrors({error, user}));
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