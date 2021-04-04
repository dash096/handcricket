const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const getEmoji = require('../../index.js');
const gain = require('../../functions/gainExp.js');
const getLevels = require('../../functions/getLevels.js');
module.exports = {
  name: 'profile',
  aliases: ['pf', 'info'],
  description: 'Shows the profile of a user.',
  category: 'Cricket',
  syntax: 'e.profile @user',
  cooldown: 6,
  run: async (message, args, prefix) => {
    const { content, author, channel, mentions } = message;
    const coinEmoji = (await getEmoji)[0];
    
    const target = mentions.users.first() || message.author;

    const data = await db.findOne({_id: target.id});
    if (!data) return message.reply(author.tag + " is not a player. Do `" + prefix + "start`");
    
    let cb = '';
    if(data.coinBoost) {
      cb = ' ⏳';
    }
    let tb = '';
    if(data.tossBoost) {
      tb = ' ⏳';
    }
    
    const levels = getLevels();
    const XPLine = await getXPLine(data.xp);
    let level = (await getPreceedingPair(levels, data.xp))[0] || 'Nab (0)';
    let targetXP = levels[level + 1] || 10;
    const STR = data.strikeRate;
    const WR = getWR(data);
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`Profile of **${target.tag}**`)
      .addField("Level - " + `${level} \`${(data.xp).toFixed(0)}xp\``, `**Next level:** ${XPLine} \`${targetXP}xp\` `)
      .addField("Balance", ` ${coinEmoji} ${data.cc}`, true)
      .addField("Wins", data.wins, true)
      .addField("Win Rate", WR.toFixed(3), true)
      .addField("Strike Rate", STR.toFixed(3), true)
      .addField("Toss Multi", data.tossMulti.toFixed(3) + tb, true)
      .addField("Coins Multi", data.coinMulti.toFixed(3) + cb, true)
      .setFooter(data.startedOn)
      .setColor('#2d61b5');

    message.reply(embed);
    await gain(data, 1, message);
  }
};

async function getXPLine(xp) {
  
  const levels = getLevels();
  const pair = await getPreceedingPair(levels, xp); //[level ,xp]
  
  //Get emojis!!!!!
  const full = (await getEmoji)[1];
  const half = (await getEmoji)[2];
  const empty = (await getEmoji)[3];
  
  //Get Suceeding Level and xp
  let pxp = xp - pair[1];
  const targetLevel = pair[0] + 1;
  const targetXP = (levels[targetLevel]) - (levels[pair[0]]);
  
  //Divide
  const divider = targetXP/10;
  const quotient = (pxp/divider).toFixed(0);
  
  //Decide Number of Bars
  let number = quotient/2;
  let numberOfFull;
  let numberOfHalf;
  //Change Bars Values
  if(number.toFixed(0) == number) {
    numberOfFull = number;
  } else {
    if(Number.isInteger(number)) {
      numberOfFull = number.toFixed(0);
    } else {
        if(number.toFixed(0) == 1) {
          numberOfFull = number.toFixed(0);
        } else {
          numberOfFull = number.toFixed(0) - 1;
          numberOfHalf = 1;
        }
    }
  }
  
  //Get Bars (perfect till now)
  let emojis = ``;
  let i = 0;
  
  for(i; i < numberOfFull; i++) {
    emojis += `${full}`;
  }
  if(numberOfHalf == 1) {
    emojis += `${half}`;
  }
  
  const line = add5(emojis);
  return line;
}


async function getPreceedingPair(levels, xp) {
  //Get preceeding xps
  const findXPs = Object.values(levels).filter(value => value <= xp);
  
  //Get preceeding level
  const levelXP = findXPs[findXPs.length - 1];
  const level = Object.keys(levels).filter(key => levels[key] == levelXP);
  
  //Push the values into an array
  const pair = [];
  await pair.push( parseInt(level[0]) );
  await pair.push(levelXP);
  
  return pair;
}

async function add5(text) {
  const empty = (await getEmoji)[3];
  
  let emojis = text;
  
  let splitted = text.split('><');
  
  if(splitted.length == 4) {
    emojis += `${empty}`;
  }
  if(splitted.length == 3) {
    emojis += `${empty}`;
    emojis += `${empty}`;
  }
  if(splitted.length == 2) {
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
  }
  if(splitted.length == 1) {
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
  }
  if(splitted.length == 0) {
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
    emojis += `${empty}`;
  }
  return emojis;
} 

function getWR(data) {
  const wins = data.wins;
  const loses = data.loses;
  if(wins + loses == 0) return 0; 
  const WR = (wins/(wins + loses)) * 100;
  return WR;
}