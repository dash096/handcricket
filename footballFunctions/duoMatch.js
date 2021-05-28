const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const rollToss = require('../functions/rollToss.js');
const chooseToss = require('../functions/chooseToss.js');
const checkWill = require('../functions/checkWill.js');

module.exports = (client, message, user, target) => {
  const { channel, author, mentions, content } = message;
  
  const userData = await db.findOne({ _id: user.id });
  const targetData = await db.findOne({ _id: target.id });
  
  let attacker;
  let batsman;
  
  let will = await checkWill();
  
  async function checkWill() {
    try {
      const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
        max: 1,
        time: 17000,
        errors: ['time']
      });
      const msg = msgs.first();
      const c = msg.content.trim().toLowerCase();
      
      if(c.startsWith('y')) {
        return true;
      } else if(c.startsWith('n')){
        msg.reply(`Match aborted`);
        return false;
      } else {
        msg.reply(`Type either \`y\`/\`n\``);
        return await checkWill();
      }
    } catch(e) {
      message.reply(getErrors({error: 'time'}));
      console.log(e);
      return false;
    }
  }
  
}