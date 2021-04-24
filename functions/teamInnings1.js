const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('./getEmbedColor.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');

module.exports = async (battingTeam, bowlingTeam, battingCap, bowlingCap, channel) => {
  let logs = {
    batting: {},
    bowling: {},
  };
  
  //Push to Logs and get Tags
  let battingTeamTags = [];
  let bowlingTeamTags = [];
  battingTeam.forEach(player => {
    if(player.id === battingCap.id) {
      battingTeamTags.push(player.tag + ' (captain)');
    } else {
      battingTeamTags.push(player.tag || 'ExtraWicket#0000');
    }
    logs.batting[player.id] = [0];
  });
  bowlingTeam.forEach(player => {
    if(player.id === bowlingCap.id) {
      bowlingTeamTags.push(player.tag + ' (captain)');
    } else {
      bowlingTeamTags.push(player.tag || 'ExtraWicket#0000');
    }
    logs.bowling[player.id] = [0];
  });
  
  let totalBalls = bowlingTeam.length * 2 * 6;
  let remainingBalls = 12;
  
  const embed = new Discord.MessageEmbed()
    .setTitle('TeamMatch')
    .addField('Batting Team', getPlayerTagWithLogs(battingTeam, logs, 'batting', battingCap))
    .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, logs, 'bowling', bowlingCap))
    .setColor(embedColor)
    .setFooter(`${remainingBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
  await channel.send(embed);
  startInnings1();
  
  
  let useDot = false;
  let dotsUsed = 0;
  let magikUsed = 0;
  
  
  function startInnings1() {
    let batsman = battingTeam[0];
    let bowler = bowlingTeam[0];
    bowler.send(embed).then(message => {
      bowlCollect(batsman, bowler, message.channel);
    });
    batsman.send(embed).then(message => {
      batCollect(batsman, bowler, message.channel);
    });
  }
  
  
  
  function bowlCollect(batsman, bowler, dm) {
    if(remainingBalls === 0) {
      let currentBowler = battingTeam.indexOf(bowler);
      let response = battingTeam[currentBowler + 1] || 'end';
      if(response !== 'end' ) remainingBalls = 12;
      respond(response, batsman, 'bowl');
      return;
    }
    //Collector
    dm.awaitMessages(
        message => message.author.id === bowler.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(messages => {
        let message = messages.first();
        let content = message.content.trim().toLowerCase();
        
        //Check Powerup
        if (content.includes('magikball') || content.includes('magik') || content == 'mb') {
          //Turn Based
          if(logs.bowler[bowler.id] > logs.batting[batsman.id]) {
             bowler.send('Wait for the batsman to hit your previous ball');
            return bowlCollect(batsman, bowler, dm);
          } //Powerup
          else {
            
          }
        } //Conversation
        else if (isNaN(content)) {
          batsman.send(content);
          return bowlCollect(batsman, bowler, dm);
        } //Turn Based
        else if (logs.bowler[bowler.id] > logs.batting[batsman.id]) {
          bowler.send('Wait for the batsman to hit the previous ball');
          return bowlCollect(batsman, bowler, dm);
        } //Limited to 6
        else if (parseInt(content) > 6) {
          bowler.send('This match is limited to 6');
          return bowlCollect(batsman, bowler, dm);
        } //Log
        else {
          remainingBalls -= 1;
          (logs.bowling[player.id]).push(parseInt(content));
          return bowlCollect(batsman, bowler, dm);
        }
    }).catch(e => {
        //CPU auto bowl
        return bowlCollect(batsman, bowler, dm);
    });
  }
  
  
  
  function batCollect(batsman, bowler, dm) {
    //Collector
    dm.awaitMessages(
        message => message.author.id === batsman.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(messages => {
        let message = messages.first();
        let content = message.content.trim().toLowerCase();
        
        //Conversation
        if (isNaN(content)) {
          bowler.send(content);
          return batCollect(batsman, bowler, dm);
        } //Turn Based
        else if (logs.batting[bowler.id].length === logs.bowling[bowler.id].length) {
          batsman.send('Wait for the batsman to hit the previous ball');
          return batCollect(batsman, bowler, dm);
        } //Limit to 6
        else if (parseInt(content) > 6) {
          batsman.send('This match is limited to 6');
          return batCollect(batsman, bowler, dm);
        } //Check Powerup
        else if (parseInt(content) === 0) {
          updateBag('dot', 1, batsman).then(response => {
            if(response === 'err') {
              return batCollect(batsman, bowler, dm);
            } else if (usedDots === 3) {
              batsman.send('Usage of dots is limited to 3 per match');
              return batCollect(batsman, bowler, dm);
            } else {
              useDot = true;
            }
          });
        } //Wicket
        if (parseInt(content) === logs.bowling[bowler.id][ logs.bowling[bowler.id] - 1 ] && useDot === false) {
          let currentBatsmanIndex = battingTeam.indexOf(bowler);
          let response = battingTeam[currentBowlerIndex + 1] || 'end';
          if(response !== 'end' ) respond(response, bowler, 'bat');
          return;
        } //Log
        else {
          (logs.batting[batsman.id]).push(parseInt(content));
          return batCollect(batsman, bowler, dm);
        }
    }).catch(e => {
        //CPU auto hit
        return batCollect(batsman, bowler, dm);
    });
  }
};



function getPlayerTagWithLogs(team, logs, type, cap) {
  let playerAndLog = [];
  
  team.forEach(player => {
    if(player.id === cap.id) {
      playerAndLog.push(`${player.tag + ' (captain)'} ${ ( (logs[type])[player.id] ) [ ( (logs[type]) [player.id] ).length - 1]}`);
    } else {
      playerAndLog.push(`${player.tag || 'ExtraWicket#0000'} ${ ( (logs[type])[player.id] ) [ ( (logs[type]) [player.id] ).length - 1]}`);
    }
  });
  
  return playerAndLog.join(`\n`);
}

function respond(response, responseX, type) {
  if(response === 'end') {
    //Second Innings
  } else {
    if(type === 'bat') {
      //Swap the batsman
      batsman = response;
      bowler = responseX;
      return batCollect(batsman, bowler, dm);
    } else if(type === 'bowl') {
      bowler = response;
      batsman = responseX;
      return bowlCollect(batsman, bowler, dm)
    }
  }
}