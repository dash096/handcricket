const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const gain = require('../functions/gainExp.js');

module.exports = {
  name: 'profile',
  aliases: ['pf', 'info'],
  category: 'handcricket',
  cooldown: '10s',
  description: 'Shows the profile of a user.',
  run: async ({message, args, text, client, prefix}) => {
    const emoji = await getEmoji[0];
    
    const target = message.mentions.users.first() || message.author;

    const data = await db.findOne({
      _id: target.id
    }).catch((e) => {
      console.log(e);
    });
    
    if (!data) {
      message.reply(message.author.tag + " is not a player. Do `" + prefix + "start`");
      return;
    }
    
    let cb = '';
    if(data.coinBoost) {
      cb = ' ⏳';
    }
    let tb = '';
    if(data.tossBoost) {
      tb = ' ⏳';
    }
    const embed = new Discord.MessageEmbed()
    .setTitle(`Profile of **${target.tag}**`)
    .addField("Level")
    .addField("Balance", ` ${emoji} ${data.cc}`, true)
    .addField("Wins", data.wins, true)
    .addField("Toss Multi", data.tossMulti + tb, true)
    .addField("Coins Multi", data.coinMulti + cb, true)
    .setFooter(data.startedOn)
    .setColor('#2d61b5');
    
    getXPLine(data.xp);

    message.reply(embed);
    await gain(data, 1);
  }
};

async function getXPLine(xp) { //40
  const levels = {
    0: 2,
    1: 10,
    2: 25,
    3: 50,
    4: 75,
    5: 100,
    6: 130,
    7: 165,
    8: 200,
    9: 250,
    10: 310,
    11: 365,
    12: 520,
    13: 585,
    14: 655,
    15: 720,
    16: 800,
    17: 888,
    18: 1001,
    19: 1234,
    20: 1500
  };
  //0:1
  const lowerLevels = [];
  
  //Fetches all lower exp milestones.
  const findXPs = Object.values(levels).filter(value => value < xp);
  
  //Fetch the level having that xp
  const levelXP = findXPs[findXPs.length - 1];
  const level = Object.keys(levels).filter(key => levels[key] === levelXP);
  
  //Push em into an array.
  const pair = [];
  await pair.push( parseInt(level[0]) );
  await pair.push(levelXP);
  
  console.log(pair);
  
  //Get emojis!!!!!
  const full = require('../index.js');
  const half = require('../index.js');
  const empty = require('../index.js');
  const fEmoji = await full[1];
  const hEmoji = await half[2];
  const eEmoji = await empty[3];
}