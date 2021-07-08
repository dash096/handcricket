const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const rollToss = require('../functions/rollToss.js');
const chooseToss = require('../functions/chooseToss.js');
const startMatch = require('./duoMatch.js');
const embedColor = require('../functions/getEmbedColor.js');
const checkWill = require('../functions/checkWill.js');

module.exports = async (client, message, user, target) => {
  const { channel, content, author } = message;
  
  //Check Target's Will
  await channel.send(`${target} do you want to play football with ${user.username}? Type \`y\`/\`n\` in 30s, flags exists.`);
  
  let post;
  if (content.toLowerCase().includes('--post')) post = true;
  
  let will = await checkWill(channel, target, post);
  post = will[1];
  will = will[0];
  
  if(will === true) {
    const tossWinner = await rollToss(message, user, target, 'football');
    if(tossWinner.id === user.id) {
      const chosen = await chooseToss(message, user, target, 'football');
      if(chosen == 'err') return;
      const attacker = chosen[0];
      const defender = chosen[1];
      let check = await checkDms();
      if (check == 'err') return;
      startMatch(client, message, attacker, defender, post)
    } else {
      const chosen = await chooseToss(message, target, user, 'football');
      if(chosen == 'err') return;
      const attacker = chosen[0];
      const defender = chosen[1];
      let check = await checkDms();
      if (check == 'err') return;
      startMatch(client, message, attacker, defender, post)
    }
  } else {
    changeStatus(user, false);
    changeStatus(target, false);
    return;
  }
  
  async function checkDms() {
    let embed = new Discord.MessageEmbed()
      .setTitle('Football Match')
      .setDescription('The Refree has blown the whistle, Lets Gooo!')
      .setColor(embedColor);
    await channel.send('Get to your DMs', { embed });
    try {
      await user.send(embed);
    } catch (e) {
      channel.send(`Cant send dms to ${user}`);
      changeStatus(user, false);
      changeStatus(target, false);
      return 'err';
    }
    try {
      await target.send(embed);
    } catch (e) {
      channel.send(`Cant send dms to ${target}`);
      changeStatus(user, false);
      changeStatus(target, false);
      return 'err';
    }
    return 'ok';
  } 
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}