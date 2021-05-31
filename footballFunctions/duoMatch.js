const db = require("../schemas/player.js");
const fs = require('fs');
const Discord = require("discord.js");
const jimp = require('jimp');
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../index.js');
const embedColor = require('../functions/getEmbedColor.js');
const positions = require('./positions.js');

module.exports = async (client, message, attacker, defender, post) => {
  const { content, channel, mentions, author } = message;
  
  let firstPair = [attacker, defender];
  
  let fieldImage = await jimp.read('./assets/field_football.jpg');
  let ballImage = await (await jimp.read('./assets/football.png')).resize(70, 70);
  
  let redFlame = await getEmoji('redflame');
  let blueFlame = await getEmoji('blueflame');
  
  function getFlame(type) {
    if(type == 'atk') {
      if (attacker.id === firstPair[0].id) return `${redFlame}`;
      else return `${blueFlame}`;
    } else {
      if (defender.id === firstPair[1].id) return `${blueFlame}`;
      else return `${redFlame}`;
    }
  }
  
  let exportPath = `./temp/${attacker.id}_${defender.id}.jpg`;
  
  let over;
  let steps = 0;
  let atkLogs = [0];
  let defLogs = [0];
  let attackerIsActive = true;
  let defenderIsActive = true;
  
  let logs = {};
  logs[`${attacker.id}`] = 0;
  logs[`${defender.id}`] = 0;
  
  executeConversation(attacker, defender);
  
  await updateField(undefined, 0, 1);
  
  const embed = new Discord.MessageEmbed()
    .setTitle('Football Match')
    .setDescription('Some Commentary')
    .addField('Attacker', `${getFlame('atk')} ${attacker.username} (\`Goals:\` ${logs[attacker.id]})`)
    .addField('Defender', `${getFlame('def')} ${defender.username} (\`Goals:\` ${logs[defender.id]})`)
    .attachFiles(exportPath)
    .setImage(`attachment://${exportPath.split('/').pop()}`)
    .setFooter("20 turns remaining until Full time")
    .setColor(embedColor)
  
  const firstAtkEmbed = await attacker.send(embed);
  const firstDefEmbed = await defender.send(embed);
  attackCollect(firstAtkEmbed);
  defendCollect(firstDefEmbed);
  
  //Core
  async function respond(goalResponse, type) {
    if(over) return;
    
    if (type == 'atk' && atkLogs.length > defLogs.length) {
      await attacker.send('Waiting for the defender...');
      await defender.send('Attacker is coming, react soon!');
      return;
    } else if (type == 'def' && defLogs.length > atkLogs.length) {
      await defender.send('Waiting for the attacker...');
      await attacker.send('Defender is coming, react soon!');
      return;
    } else {
      await reply();
      return;
    }
    
    async function reply() {
      if (!goalResponse) {
        steps += 1;
        
        let goalChance;
        let text = '';
        
        let embed = new Discord.MessageEmbed()
          .setTitle('Football Match')
          .setDescription('Some Commentary')
          .addField('Attacker', `${getFlame('atk')} ${attacker.username} (${logs[attacker.id]})`)
          .addField('Defender', `${getFlame('def')} ${defender.username} (${logs[defender.id]})`)
          .attachFiles(exportPath)
          .setImage(`attachment://${exportPath.split('/').pop()}`)
          .setFooter((20 - atkLogs.length).toString() + " turns remaining until Full time")
          .setColor(embedColor)
          
        if (atkLogs.slice(-1)[0] === defLogs.slice(-1)[0]) {
          [attacker, defender] = [defender, attacker];
          await updateField(undefined, 0, 1);
          
          text += 'The defender stole the ball.';
          steps = 0;
          embed
            .setDescription('Some Commentary')
            .spliceFields(0, 2)
            .addField('Attacker', `${getFlame('atk')} ${attacker.username} (${logs[attacker.id]})`)
            .addField('Defender', `${getFlame('def')} ${defender.username} (${logs[defender.id]})`)
            .attachFiles(exportPath)
            .setImage(`attachment://${exportPath.split('/').pop()}`)
        } else {
          await updateField(undefined, steps, atkLogs.slice(-1)[0]);
          if (steps === 3) {
            goalChance = true;
            text += 'The attacker is near the post. It is a **Goal Chance**!';
          } else {
            text += 'The attacker tricked the defender.';
          }
        }
        
        if (post === true) channel.send(text, { embed });
        let atkEmbed = await attacker.send(text, { embed });
        let defEmbed = await defender.send(text, { embed });
        
        await checkTimeup();
        if(over) return;
        
        attackCollect(atkEmbed, goalChance);
        defendCollect(defEmbed, goalChance);
        return;
      } else if (goalResponse) {
        steps = 0;
        
        let text;
        
        let embed = new Discord.MessageEmbed()
          .setTitle('Football Match')
          .setDescription('Some Commentary')
          .addField('Attacker', `${getFlame('atk')} ${attacker.username} (${logs[attacker.id]})`)
          .addField('Defender', `${getFlame('def')} ${defender.username} (${logs[defender.id]})`)
          .attachFiles(exportPath)
          .setImage(`attachment://${exportPath.split('/').pop()}`)
          .setFooter((20 - atkLogs.length).toString() + " turns remaining until Full time")
          .setColor(embedColor)
        
        let attackerChoice = atkLogs.slice(-1)[0];
        let defenderChoice = defLogs.slice(-1)[0];
        
        [attacker, defender] = [defender, attacker];
        
        if (attackerChoice == defenderChoice) {
          await updateField(undefined, 0, 1);
          text = `Defender stopped the goal`;
        } else {
          await updateField(true, atkLogs.slice(-1)[0], 1);
          text = "Goal!!";
          logs[defender.id] += 1;
          
          embed
            .setDescription('Some Commentary')
            .attachFiles(exportPath)
            .setImage(`attachment://${exportPath.split('/').pop()}`)
          
          if(logs[defender.id] === 2) {
            over = true;
            changeStatus(attacker, false);
            changeStatus(defender, false);
            if(post === true) channel.send(`${defender.username} is the first to reach 2 goals! They won!`, { embed })
            defender.send(`You won! You are the first to reach 2 goals!`, { embed })
            attacker.send(`You lost, ${attacker.username} is the first to reach 2 goals!`, { embed })
            return;
          }
        }
        
        if (post === true) channel.send(text, { embed });
        let atkEmbed = await attacker.send(text, { embed });
        let defEmbed = await defender.send(text, { embed });
        
        await checkTimeup();
        if(over) return;
        
        attackCollect(atkEmbed, undefined);
        defendCollect(defEmbed, undefined);
        return;
      }
    }
  }
  
  async function attackCollect(msg, goalChance) {
    if(over) return;
    
    msg.awaitReactions((reaction, user) => user.id === attacker.id, {
      time: 45000,
      max: 1,
      errors: ['time'],
    }).then(async (collected) => {
      if(over) return;
      
      const emoji = collected.first().emoji.name;
      
      if(atkLogs.length > defLogs.length) {
        attacker.send('Wait for the defender...');
        return attackCollect(msg);
      } else if (emoji == '↖️' && goalChance) {
        atkLogs.push('left');
        await respond(goalChance, 'atk');
      } else if (emoji == '⬆️' && goalChance) {
        atkLogs.push('center');
        await respond(goalChance, 'atk');
      } else if (emoji == '↗️' && goalChance) {
        atkLogs.push('right');
        await respond(goalChance, 'atk');
      } else if (emoji == '1️⃣' && !goalChance) {
        atkLogs.push(1);
        await respond(goalChance, 'atk');
      } else if (emoji == '2️⃣' && !goalChance) {
        atkLogs.push(2);
        await respond(goalChance, 'atk');
      } else if (emoji == '3️⃣' && !goalChance) {
        atkLogs.push(3);
        await respond(goalChance, 'atk');
      } else {
        attacker.send('Invalid Emoji! Sus');
        return attackCollect(msg, goalChance);
      }
    }).catch(async e => {
      if(over) return;
      console.log('ar', e);
      
      if(
        attacker.id === firstPair[0].id &&
        attackerIsActive === false ||
        attacker.id === firstPair[1].id &&
        defenderIsActive === false
      ) {
        over = true;
        changeStatus(attacker, false);
        changeStatus(defender, false);
        attacker.send(`Match Ended, as you were inactive`);
        defender.send(`Match Ended, as **${attacker.username}** was inactive`);
        if(post === true) channel.send(`Match Ended, as **${attacker.username}** was inactive`);
        return;
      } else {
        await attacker.send('React when?');
        return attackCollect(msg, goalChance);
      }
    });
      
    if(!goalChance) {
      await msg.react('1️⃣');
      await msg.react('2️⃣');
      await msg.react('3️⃣');
    } else {
      await msg.react('↖️');
      await msg.react('⬆️');
      await msg.react('↗️');
    }
    
  }
  
  async function defendCollect(msg, goalChance) {
    if(over) return;
    
    msg.awaitReactions((reaction, user) => user.id === defender.id, {
      time: 45000,
      max: 1,
      errors: ['time'],
    }).then(async (collected) => {
      if(over) return;
      
      const emoji = collected.first().emoji.name;
      
      if(defLogs.length > atkLogs.length) {
        defender.send('Wait for the attacker to come...');
        return defendCollect(msg);
      } else if (emoji == '↖️' && goalChance) {
        defLogs.push('left');
        await respond(goalChance, 'def');
      } else if (emoji == '⬆️' && goalChance) {
        defLogs.push('center');
        await respond(goalChance, 'def');
      } else if (emoji == '↗️' && goalChance) {
        defLogs.push('right');
        await respond(goalChance, 'def');
      } else if(emoji == '1️⃣' && !goalChance) {
        defLogs.push(1);
        await respond(goalChance, 'def');
      } else if (emoji == '2️⃣' && !goalChance) {
        defLogs.push(2);
        await respond(goalChance, 'def');
      } else if (emoji == '3️⃣' && !goalChance) {
        defLogs.push(3);
        await respond(goalChance, 'def');
      } else {
        defender.send('Invalid Emoji! Sus');
        return defendCollect(msg);
      }
    }).catch(async e => {
      if(over) return;
      console.log('dr', e);
      
      if(
        defender.id === firstPair[1].id &&
        defenderIsActive === false ||
        defender.id === firstPair[0].id &&
        attackerIsActive === false
      ) {
        over = true;
        changeStatus(attacker, false);
        changeStatus(defender, false);
        attacker.send(`Match Ended, as **${defender.username}** was inactive`);
        defender.send(`Match Ended, as you were inactive`);
        if(post === true) channel.send(`Match Ended, as **${defender.username}** was inactive`);
        return;
      } else {
        await defender.send('React when?');
        return defendCollect(msg, goalChance);
      }
    });
      
    if(!goalChance) {
      await msg.react('1️⃣');
      await msg.react('2️⃣');
      await msg.react('3️⃣');
    } else {
      await msg.react('↖️');
      await msg.react('⬆️');
      await msg.react('↗️');
    }
    
  }
  
  
  async function executeConversation(user, target) {
    userCollect(); targetCollect();
    
    function userCollect() {
      if(over) return;
      user.dmChannel.awaitMessages(m => m.author.id === user.id, {
        max: 1,
        time: 20000,
        errors: ['time'],
      }).then(msgs => {
        attackerIsActive = true;
        let msg = msgs.first();
        let { content } = msg;
        let c = msg.content.toLowerCase().trim();
        if(c == 'end') {
          over = true;
          user.send('You forfeited.');
          target.send(`**${user.username}** forfeited`);
          return;
        } else {
          target.send(`\`${user.username}:\` ${content}`);
          return userCollect();
        }
      }).catch(e => {
        if(over) return;
        console.log('u', e);
        attackerIsActive = false;
        return userCollect()
      });
    }
    
    function targetCollect() {
      if(over) return;
      target.dmChannel.awaitMessages(m => m.author.id === target.id, {
        max: 1,
        time: 20000,
        errors: ['time'],
      }).then(msgs => {
        defenderIsActive = true;
        
        let msg = msgs.first();
        let { content } = msg;
        let c = msg.content.toLowerCase().trim();
        if(c == 'end') {
          over = true;
          target.send('You forfeited.');
          user.send(`**${target.username}** forfeited.`);
          if(post === true) channel.send(`**${target.username}** forfeited.`);
          return;
        } else {
          user.send(`\`${target.username}:\` ${content}`);
          return targetCollect();
        }
      }).catch(e => {
        if(over) return;
        console.log('t', e);
        defenderIsActive = false;
        return targetCollect();
      });
    }
  }
  
  async function updateField(goal, step, attack) {
    console.log(step, attack);
    
    let newFieldImage = await fieldImage.clone()
    
    let resizeX = 150;
    let resizeY = 150;
    let goalText = "Goal!";
    let centerX = 500;
    let centerY = 550;
    
    if(firstPair[0].id === attacker.id) {
      let ballPosition = positions.red[step - 1] || positions.blue[step];
      ballPosition = ballPosition[attack - 1];
      
      await newFieldImage
        .composite(ballImage, ballPosition.x, ballPosition.y)
      
    } else {
      let ballPosition;
      
      if(!goal) {
        ballPosition = positions.blue[step - 1] || positions.blue[step];
        ballPosition = ballPosition[attack - 1];
      } else {
        ballPosition = positions.red[step - 1] || positions.red[step];
        ballPosition = ballPosition[attack - 1];
      }
      
      await newFieldImage
        .composite(ballImage, ballPosition.x, ballPosition.y)
      
      if(goal)  {
        await newFieldImage
          .print(await jimp.loadFont(jimp.FONT_SANS_128_BLACK), centerX, centerY, goalText)
      } else {
        await newFieldImage
          .flip(false, true)
      }
    }
    
    await newFieldImage
      .resize(resizeX, resizeY)
      .write(exportPath)
    return;
  }
  
  async function penalty(reason) {
    console.log('Penalty starts!');
    attacker.send(reason, ' Penalty Shootout starts but yet to be made...');
    defender.send(reason, ' Penalty Shootout starts but yet to be made...');
    return;
  }
  
  function checkTimeup() {
    console.log((Date.now() - startTime)/1000, timeoutTime/1000, steps);
    
    if (atkLogs.length > 17) {
      if (steps === 0) {
        penalty('Full Time');
        over = true;
        changeStatus(attacker, false);
        changeStatus(defender, false);
        return;
      }
    }
    return;
  }
  
  async function changeStatus(user, boolean) {
    if(boolean !== true && boolean !== false) return;
    
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        status: boolean
      }
    });
    
    await fs.unlink(exportPath, (e) => {
      if(e) console.log(e);
    });
  }
};