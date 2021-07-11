const fs = require('fs');
const Discord = require("discord.js");
const db = require("../../schemas/player.js");
const jimp = require('jimp');
const getEmoji = require('../../functions/getEmoji.js');
const gain = require('../../functions/gainExp.js');
const getLevels = require('../../functions/getLevels.js');
const getTarget = require('../../functions/getTarget.js');
const getDecors = require('../../functions/getDecors.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'profile',
  aliases: ['pf', 'stat'],
  description: 'Shows the profile of a user.',
  category: 'Dogenomy',
  syntax: 'e.profile [@user/userID]',
  cooldown: 6,
  run: async ({message, args, client}) => {
    const { content, author, channel, mentions } = message;
    
    const coinEmoji = await getEmoji('coin');
    
    let target = await getTarget(message, args, client);
    if(!target) return;
    
    const data = await db.findOne({_id: target.id});
    
    let cb = '';
    if(data.coinBoost) {
      cb = ' ⏳';
    }
    let tb = '';
    if(data.tossBoost) {
      tb = ' ⏳';
    }
    
    const levels = getLevels();
    let level = (await getPreceedingPair(levels, data.xp))[0] || 'Nab (0)';
    let targetXP = levels[level + 1] || 10;
    const XPLine = await getXPLine(data.xp);
    const staminaLine = await getStaminaLine(data.stamina || 0);
    const xpFixed = data.xp.toFixed(0);
    const STR = data.strikeRate;
    const WR = getWR(data);
    const orangeCaps = data.orangeCaps || 0;
    
    const characterPath = await new Promise(r => { getCharacter(target, r) })
    const characterAttachment = new Discord.MessageAttachment(characterPath);
    
    let description = userInfo();
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`Profile of **${target.displayName}**`)
      .setThumbnail(target.displayAvatarURL({size: 64}))
      .setDescription(description)
      .setFooter("Your Character looks cool! Use `e.equip <name>` to wear a decor for your character")
      .attachFiles(characterAttachment)
      .setImage(`attachment://${characterPath.split('/').pop()}`)
      .setColor(embedColor);
    
    await message.reply(embed);
    await gain(data, 1, message);
      
    setTimeout(async () => {
      await fs.unlink(`${characterPath}`, (e) => {
        if(e) console.log(e);
      });
    }, 5000);
    
    function userInfo() {
      let text =
      `**Stamina** \`${data.stamina || 0}/10\`\n${staminaLine}\n` +
      `**Level ${level}** ${XPLine}\n\n` +
      `**Balance**             ${coinEmoji} ${data.cc}\n` +
      `**Wins**                    ${data.wins}\n` +
      `**Wickets**               ${data.wickets}\n` +
      `**Strike Rate**        ${data.strikeRate.toFixed(3)}\n` +
      `**High Score**         ${data.highScore || 0}\n` +
      `**Total Score**        ${data.totalScore || 0}\n` +
      `**OrangeCaps**     ${data.orangeCaps}\n` +
      `**Toss Multi**        ${data.tossMulti.toFixed(3)}${tb}\n` +
      `**Coin Multi**         ${data.coinMulti.toFixed(3)}${cb}`
      return text;
    }
  }
};

async function getStaminaLine(stamina) {
  const fill = await getEmoji('stamina_fill');
  const empty = await getEmoji('stamina_empty');
  
  let text = '';
  for(i = 0; i < stamina; i++) {
    text += `${fill}`;
  }
  for(i = stamina; i < 10; i++) {
    text += `${empty}`;
  }
  return text;
}

async function getXPLine(xp) {
  
  const levels = getLevels();
  const pair = await getPreceedingPair(levels, xp); //[level ,xp]
  
  //Get emojis!!!!!
  const full = await getEmoji('full');
  const half = await getEmoji('half');
  const empty = await getEmoji('empty');
  
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
  
  const line = add5(emojis, empty);
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

async function add5(text, empty) {
  let emojis = text;
  
  let splitted = text.split('><');
  let i = splitted.length;
  
  for(i; i < 5; i++) {
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

async function getCharacter(target, resolve) {
  const userData = await db.findOne({_id: target.id});
  
  let type = 'type1';
  const decorsData = getDecors(type);
  
  const userDecors = userData.decors || {};
  const equippedDecors = userDecors.equipped || [];
  
  const images = [];
  
  if(equippedDecors.length > 0) {
    await equippedDecors.forEach(decor => {
      if(decor.startsWith('decor') || decor.startsWith('head')) {
        images.push(`./assets/decors/${type}/${decor}.png`);
      } else {
        images.unshift(`./assets/decors/${type}/${decor}.png`);
      }
    });
  }
  const image = await getImage(target, type, images)
  resolve(image)
  return image
}

async function getImage(target, type, paths) {
  let character = await jimp.read(`./assets/decors/${type}/character.png`);
  let exportPath = `./temp/${target.id}.png`;
  
  if(paths.length > 0) {
    let i = 0;
    await paths.forEach(async path => {
      i += 1;
      if(i === paths.length) {
        character
          .composite(await jimp.read(path), 0, 0)
          .write(exportPath)
      } else {
        character
          .composite(await jimp.read(path), 0, 0)
      }
    });
  } else {
    await character.write(exportPath);
  }
  return exportPath;
}