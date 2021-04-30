const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../../functions/getErrors.js');
const getTarget = require('../../functions/getTarget.js');
const firstInnings = require("../../functions/duoInnings1.js");
const executeTeamMatch = require("../../functions/teamMatch.js");
const executeDuoMatch = require("../../functions/duoMatch.js");
const serverID = process.env.SERVERID;

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket", "play"],
  description: "Play handcricket with a user",
  category: 'Cricket',
  syntax: 'e.handcricket @user --post (to post scores in channel)',
  status: true,
  cooldown: 10,
  run: async ({message, args, client}) => {
    const { content, author, guild, channel, mentions } = message;
    
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
        if(guild.id !== serverID) {
          message.reply(`teamMatches for a couple days, can only be used in official server (${prefix}invite) cause it would be easy for the developers to notice any bugs.`)
        } else {
          executeTeamMatch(message, client);
        }
      } else { //Solo Match
        //Target Validation
        const target = await getTarget(message, args, client);
        if(!target) return;
        if(user.id === target.id) {
          return message.reply(getErrors({error: 'syntax', filePath: 'cricket/handcricket.js'}));
        }
        //Status Validation
        const targetdata = await db.findOne({_id: target.id});
        if(targetdata.status === true) {
          let error = 'engaged';
          message.reply(getErrors({error, target}));
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
  }
};
 
async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}