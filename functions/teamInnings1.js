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
  let totalBallsPerBowler = 12; 
  let remainingBalls = totalBalls;
  
  const embed = new Discord.MessageEmbed()
    .setTitle(`TeamMatch Captains: ${battingCap.tag}, ${bowlingCap.tag}`)
    .addField('Batting Team', getPlayerTagWithLogs(battingTeam, logs, 'batting'))
    .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, logs, 'bowling'))
    .setColor(embedColor)
    .setFooter(`${remainingBalls} balls more left, Bowler changes every 2 overs (12 balls)`);
  await channel.send(embed);
  start();
  
  
  
  async function start() {
    let batsman = battingTeam[0];
    let bowler = bowlingTeam[0];
    let bowlerDm = bowler.send('Here').then( (message) => { return message.channel });
    let batsmanDm = batsman.send('Here').then( (message) => { return message.channel });
    executeBowlCollect(); executeBatCollect();
    
    function executeBowlCollect(batsman, bowler, bowlerDm, batsmanDm) {
      bowlCollect(batsman, bowler, bowlerDm, batsmanDm).then(response => {
        if(response === 'end') {
          //start secondInnings
          console.log('2nd Innings start when');
        } else {
          //Swap the bowler
          batsman = response;
          batsmanDm = batsman.send('Here').then( (message) => { return message.channel });
          return executeBatCollect(batsman, bowler, bowlerDm, batsmanDm);
        }
      });
    }
    function executeBatCollect(batsman, bowler, bowlerDm, batsmanDm) {
      batCollect(batsman, bowler, bowlerDm, batsmanDm).then(response => {
        if(response === 'end') {
          //start secondInnings
          console.log('2nd Innings start when');
        } else {
          //Swap the batsman
          batsman = response;
          batsmanDm = batsman.send('Here').then( (message) => { return message.channel });
          return executeBatCollect(batsman, bowler, bowlerDm, batsmanDm);
        }
      });
    }
  }
  
  let useDot = false;
  let dotsUsed = 0;
  let magikUsed = 0;
  
  function bowlCollect(batsman, bowler, bowlerDm, batsmanDm) {
    if(remainingBalls === 0) {
      let currentBowler = battingTeam.indexOf(bowler);
      let nextBowler = battingTeam[currentBowler + 1] || 'end';
      return nextBowler;
    }
    //Collector
    bowlerDm.awaitMessages(
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
          return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
        } //Powerup 
        else {
          
        }
      } //Conversation
      else if (isNaN(content)) {
        batsman.send(content);
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Turn Based
      else if (logs.bowler[bowler.id] > logs.batting[batsman.id]) {
        bowler.send('Wait for the batsman to hit the previous ball');
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Limited to 6
      else if (parseInt(content) > 6) {
        bowler.send('This match is limited to 6');
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Log
      else {
        remainingBalls -= 1;
        (logs.bowling[player.id]).push(parseInt(content));
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      }
    }).catch(e => {
      //CPU auto bowl
      console.log('CPU autoBowl');
    });
  }
  
  
  
  function batCollect(batsman, bowler, bowlerDm, batsmanDm) {
    //Collector
    batsmanDm.awaitMessages(
      message => message.author.id ==- bowler.id,
      { max: 1, time: 20000, errors: ['time'] }
    ).then(messages => {
      let message = messages.first();
      let content = message.content.trim().toLowerCase();
      
      //Conversation
      if (isNaN(content)) {
        bowler.send(content);
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Turn Based
      else if (logs.batting[bowler.id].length === logs.bowling[bowler.id].length) {
        batsman.send('Wait for the batsman to hit the previous ball');
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Limit to 6
      else if (parseInt(content) > 6) {
        bowler.send('This match is limited to 6');
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      } //Check Powerup
      else if (parseInt(content) === 0) {
        updateBag('dot', 1, batsman).then(response => {
          if(response === 'err') {
            return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
          } else if (usedDots === 3) {
            batsman.send('Usage of dots is limited to 3 per match');
            return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
          } else {
            useDot = true;
          }
        });
      } //Wicket
      if (parseInt(content) === logs.bowling[bowler.id][ logs.bowling[bowler.id] - 1 ] && useDot === false) {
        let currentBatsmanIndex = battingTeam.indexOf(bowler);
        let nextBatsman = battingTeam[currentBowlerIndex + 1] || 'end';
        return nextBowler;
      } //Log
      else {
        (logs.batting[batsman.id]).push(parseInt(content));
        return bowlCollect(batsman, bowler, bowlerDm, batsmanDm);
      }
    }).catch(e => {
      //CPU auto hit
      console.log('CPU autoBat');
      return batCollect(batsman, bowler, bowlerDm, batsmanDm);
    })
  }
};

function getPlayerTagWithLogs(team, logs, type) {
  let playerAndLog = [];
  
  team.forEach( player => {
    playerAndLog.push(`${player.tag || 'ExtraWicket#0000'} ${ ( (logs[type])[player.id] ) [ ( (logs[type]) [player.id] ).length - 1]}`);
  });
  
  return playerAndLog.join(`\n`);
}