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
  await channel.send(`${target} do you want to play baseball with ${user.username}? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the progress in this channel`);
  
  let post;
  if (content.toLowerCase().includes('--post')) post = true;
  
  let will = await checkWill(channel, target, post);
  post = will[1];
  will = will[0];
  
  if (will === true) {
    const tossWinner = await rollToss(message, user, target, 'baseball');
    
    if(tossWinner.id === user.id) {
      const chosen = await chooseToss(message, user, target, 'baseball');
      if(chosen == 'err') return;
      const striker = chosen[0];
      const pitcher = chosen[1];
      let check = await checkDms();
      if (check == 'err') return;
      startMatch(client, message, striker, pitcher, post);
    } else {
      const chosen = await chooseToss(message, target, user, 'baseball');
      if(chosen == 'err') return;
      const striker = chosen[0];
      const pitcher = chosen[1];
      let check = await checkDms();
      if (check == 'err') return;
      startMatch(client, message, striker, pitcher, post);
    }
  } else {
    changeStatus(user, false);
    changeStatus(target, false);
    return;
  }
  
  async function checkDms() {
    let embed = new Discord.MessageEmbed()
      .setTitle('Baseball Match')
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

async function changeStatus(user, boolean) {
  if(typeof boolean !== 'boolean') return;
  
  await db.findOneAndUpdate({ _id: user.id }, {
    $set: {
      status: boolean,
    }
  });
}