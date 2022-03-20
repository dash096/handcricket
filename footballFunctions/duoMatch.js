const db = require("../schemas/player.js");
const fs = require('fs');
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');
const rewards = require('./rewards.js');

module.exports = async (client, message, attacker, defender, post) => {
  const { content, channel, mentions, author } = message;
  let firstPair = [attacker, defender];
  
  let goalpostRedYellowPath = './assets/goalpost_ry.jpg';
  let goalpostYellowRedPath = './assets/goalpost_yr.jpg';
  let redFlame = await getEmoji('redflame');
  let blueFlame = await getEmoji('yellowflame');
  
  let over;
  let atkLogs = [0];
  let defLogs = [0];
  let attackerIsActive = true;
  let defenderIsActive = true;
  let atkResults = [];
  let defResults = [];
  
  executeConversation(attacker, defender);
  
  let logs = {};
  logs[`${attacker.id}`] = [];
  logs[`${defender.id}`] = [];
  logs.scores = {};
  logs.scores[`${attacker.id}`] = 0;
  logs.scores[`${defender.id}`] = 0;
  
  const embed = new Discord.MessageEmbed()
    .setTitle('Football Match')
    .addField('Attacker', `${getFlame('atk')} ${attacker.username} (\`Goals:\` ${logs.scores[attacker.id]})`)
    .addField('Defender', `${getFlame('def')} ${defender.username} (\`Goals:\` ${logs.scores[defender.id]})`)
    .attachFiles(getGoalpostImage())
    .setImage(`attachment://${getGoalpostImage().split('/').pop()}`)
    .setFooter('The person who breaks the goal lead after 5 chances wins.')
    .setColor(embedColor)
  
  const firstAtkEmbed = await attacker.send(embed);
  const firstDefEmbed = await defender.send(embed);
  attackCollect(firstAtkEmbed);
  defendCollect(firstDefEmbed);
  
  //Core
  async function respond(type) {
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
      let text;
      
      let attackerChoice = atkLogs.slice(-1)[0];
      let defenderChoice = defLogs.slice(-1)[0];
      
      [attacker, defender] = [defender, attacker];
      
      if (attackerChoice == defenderChoice) {
        text = `Defender stopped the goal`;
        logs[defender.id].push(undefined);
      } else {
        text = "Goal!!";
        logs[defender.id].push('goal');
        logs.scores[defender.id] += 1;
      }
      
      let embed = new Discord.MessageEmbed()
        .setTitle('Football Match')
        .addField('Current Attacker', `${getFlame('atk')} ${attacker.username} (\`Goals:\` ${logs.scores[attacker.id]})\n    ${getPenaltyHistory('atk')}`)
        .addField('Current Defender', `${getFlame('def')} ${defender.username} (\`Goals:\` ${logs.scores[defender.id]})\n    ${getPenaltyHistory('def')}`)
        .attachFiles(getGoalpostImage())
        .setImage(`attachment://${getGoalpostImage().split('/').pop()}`)
        .setFooter('The person who breaks the goal lead after 5 chances wins.')
        .setColor(embedColor)
        
      if (post === true) channel.send(text, { embed });
      let atkEmbed = await attacker.send(text, { embed });
      let defEmbed = await defender.send(text, { embed });
      
      if (logs[defender.id].length >= 5 && logs[attacker.id].length >= 5) {
        let attackerGoals = logs.scores[attacker.id];
        let defenderGoals = logs.scores[defender.id];
        
        if (
          attackerGoals !== defenderGoals &&
          logs[defender.id].length === logs[attacker.id].length
        ) {
          let winner;
          let loser;
          if (attackerGoals > defenderGoals) {
            winner = attacker;
            loser = defender;
          } else {
            winner = defender;
            loser = attacker;
          }
          over = true;
          if(post === true) channel.send(`${winner.username} scored more goals, They won!`);
          loser.send(`You lost as **${winner.username}** score more goals..`);
          winner.send(`You won! You scored the most goals`);
          
          await rewards(winner, loser, channel);
          
          await changeStatus(attacker, false);
          await changeStatus(defender, false);
        } else {
          attackCollect(atkEmbed);
          defendCollect(defEmbed);
        }
      } else {
        attackCollect(atkEmbed);
        defendCollect(defEmbed);
      }
      return;
    }
  }
  
  
  async function attackCollect(msg) {
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
      } else if (emoji == '↖️') {
        atkLogs.push('left');
        await respond('atk');
      } else if (emoji == '⬆️') {
        atkLogs.push('center');
        await respond('atk');
      } else if (emoji == '↗️') {
        atkLogs.push('right');
        await respond('atk');
      } else {
        attacker.send('Invalid Emoji! Sus');
        return attackCollect(msg);
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
        return attackCollect(msg);
      }
    });
    
    await msg.react('↖️');
    await msg.react('⬆️');
    await msg.react('↗️');
  }
  
  async function defendCollect(msg) {
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
      } else if (emoji == '↖️') {
        defLogs.push('left');
        await respond('def');
      } else if (emoji == '⬆️') {
        defLogs.push('center');
        await respond('def');
      } else if (emoji == '↗️') {
        defLogs.push('right');
        await respond('def');
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
        return defendCollect(msg);
      }
    });
      
    await msg.react('↖️');
    await msg.react('⬆️');
    await msg.react('↗️');
  }
  
  function getGoalpostImage() {
    if(firstPair[0].id === attacker.id) {
      return goalpostRedYellowPath
    } else {
      return goalpostYellowRedPath
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
        if(c == 'end' || c =='e.hc end' || c == 'e.hc x') {
          over = true;
          user.send('You forfeited.');
          target.send(`**${user.username}** forfeited`);
          if(post === true) channel.send(`**${user.username}** forfeited.`);
          changsStatus(attacker, false);
          changsStatus(defender, false);
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
        if(c == 'end' || c =='e.hc end' || c == 'e.hc x') {
          over = true;
          target.send('You forfeited.');
          user.send(`**${target.username}** forfeited.`);
          if(post === true) channel.send(`**${target.username}** forfeited.`);
          changsStatus(attacker, false);
          changsStatus(defender, false);
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
  
  function getPenaltyHistory(type) {
    let text = '';
    let history;
    let unlisted = [];
    
    if(type == 'atk') {
      history = logs[attacker.id];
    } else {
      history = logs[defender.id];
    }
    
    for(let i = history.length; i < 5; i++) {
      unlisted.push('  -');
    }
    
    history.forEach(score => {
      if (score === undefined) {
        text += ` ❌`;
      } else if (score == 'goal') {
        text += ` ✅`;
      } else {
        text += score;
      }
    });
    
    return text + ` ${unlisted.join('')}`;
  }
  
  async function changeStatus(user, boolean) {
    if(boolean !== true && boolean !== false) return;
    
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        status: boolean
      }
    });
    
    await fs.unlink(exportPath, (e) => {});
  }
  
  function getFlame(type) {
    if(type == 'atk') {
      if (attacker.id === firstPair[0].id) return `${redFlame}`;
      else return `${blueFlame}`;
    } else {
      if (defender.id === firstPair[1].id) return `${blueFlame}`;
      else return `${redFlame}`;
    }
  }
};
