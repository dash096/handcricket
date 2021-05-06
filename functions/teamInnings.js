const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('./getEmbedColor.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBags = require('./updateBag.js');
let isInnings2;
let checkTimeup = [];

module.exports = async function innings(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, oldLogs) {
  let target;
  if(oldLogs) {
    target = 1;
    (Object.keys(oldLogs.batting)).forEach(batsman => {
      target += ((oldLogs.batting)[batsman])[(oldLogs.batting[batsman]).length - 1];
    });
  }
  
  let logs = {
    batting: {},
    bowling: {},
  };
  
  function getPlayerTagWithLogs(team, type, cap) {
    let playerAndLog = [];
    team.forEach(player => {
      let log = (logs[type])[player.id || '0000'];
      if(type === 'batting') {
        if(player.id === cap.id) {
          playerAndLog.push(`${player.tag + ' (captain)'} ${ log[log.length - 1] }`);
        } else {
          playerAndLog.push(`${player.tag || `${extraPlayer.tag} (EW)`} ${ log[log.length - 1] }`);
        }
      } else {
        if(!oldLogs) {
          playerAndLog.push(`${player.tag || `${extraPlayer.tag} (EW)`} 0`);
        } else {
          let score = oldLogs.batting[player.id || '0000'];
          playerAndLog.push(`${player.tag || `${extraPlayer.tag} (EW)`} ${score}`);
        }
      }
    });
    if(type === 'bowling' && oldLogs) {
      playerAndLog.push(`${target} is the Target Score`);
    }
    return playerAndLog.join(`\n`);
  }

  //Push to Logs and get Tags
  let battingTeamTags = [];
  let bowlingTeamTags = [];
  battingTeam.forEach(player => {
    if(player.id === battingCap.id) {
      battingTeamTags.push(player.tag + ' (captain)');
    } else {
      battingTeamTags.push(player.tag || `${extraPlayer.tag} (EW)`);
    }
    logs.batting[player.id || '0000'] = [0];
  });
  bowlingTeam.forEach(player => {
    if(player.id === bowlingCap.id) {
      bowlingTeamTags.push(player.tag + ' (captain)');
    } else {
      bowlingTeamTags.push(player.tag || `${extraPlayer.tag} (EW)`);
    }
    logs.bowling[player.id || '0000'] = [0];
  });
  
  let totalBalls = bowlingTeam.length * 2 * 6;
  let remainingBalls = 12;
  
  const embed = new Discord.MessageEmbed()
    .setTitle('TeamMatch')
    .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
    .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
    .setColor(embedColor)
    .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
  
  await channel.send(embed);
  await startInnings();
  
  function startInnings() {
    let batsman = battingTeam[0];
    let bowler = bowlingTeam[0];
    bowler.send(embed).then(message => {
      bowlCollect(batsman, bowler, message.channel);
    });
    batsman.send(embed).then(message => {
      batCollect(batsman, bowler, message.channel);
    });
  }
  
  let bowlExtra;
  let batExtra;
  let batSwap;
  let bowlSwap;
  
  //Core  
  async function respond(response, responseX, oldResponse, type) {
    checkTimeup = [];
    
    const embed = new Discord.MessageEmbed()
      .setTitle('TeamMatch')
      .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
      .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
      .setColor(embedColor)
      .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
        
    if(response === 'forceEnd') {
      isInnings2 = 'over';
      changeStatus(players, false)
      channel.send('both the batsman and bowler are offline. Match ended.');
      return;
    } else if(!oldLogs) {
      if(response === 'end') {
        let batsmen = Object.keys(logs.batting);
        let bowlers = Object.keys(logs.bowling);
        batsmen.forEach(batsman => {
          (logs.batting)[batsman] = [ ((logs.batting)[batsman]) [((logs.batting)[batsman]).length - 1] ];
        });
        bowlers.forEach(bowler => {
          (logs.bowling)[bowler] = [0];
        });
        isInnings2 = true;
        return innings(players, bowlingTeam, battingTeam, bowlingCap, battingCap, extraPlayer, channel, logs);
      } else {
        if(type === 'bat') {
          logs.bowling[responseX.id] = [0];
          if(batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
          else logs.batting[oldResponse.id] = [(logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1]];
          
          const dm = (await response.send(`Your turn to bat`, {embed})).channel;
          batSwap = response;
          return batCollect(response, responseX, dm);
        } else if(type === 'bowl') {
          logs.bowling[oldResponse.id] = [0];
          if(batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
          else logs.batting[responseX.id] = [(logs.batting[responseX.id])[(logs.batting[responseX.id]).length - 1]];
          
          bowlSwap = response;
          const dm = (await bowlSwap.send(`Your turn to bowl`, {embed})).channel;
          return bowlCollect(responseX, response, dm);
        }
      }
    } else {
      if(response === 'end') {
        isInnings2 = 'over';
        changeStatus(players, false)
        console.log('BowlingTeam Won')
        //rewards for bowlingTeam
      } else if (response === 'win') {
        isInnings2 = 'over';
        changeStatus(players, false)
        console.log('battingTeam won')
        //rewards for battingTeam
      } else {
        if(type === 'bat') {
          logs.bowling[responseX.id] = [0];
          if(batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
          else logs.batting[oldResponse.id] = [(logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1]];
          
          batSwap = response
          const dm = (await batSwap.send(`Your turn to bat`, {embed})).channel;
          return batCollect(response, responseX, dm);
        } else if(type === 'bowl') {
          logs.bowling[oldResponse.id] = [0];
          if(batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
          else logs.batting[responseX.id] = [(logs.batting[responseX.id])[(logs.batting[responseX.id]).length - 1]];
          
          bowlSwap = response
          const dm = await (await batSwap.send(`Your turn to bowl`, {embed})).channel;
          return bowlCollect(responseX, response, dm);
        }
      }
    }
  }
  
  function bowlCollect(batsman, bowler, dm) {
    if(isInnings2 && !oldLogs) return;
    if(isInnings2 === 'over') return;
    //Swap the batsman if wicket
    if(batSwap) {
      batsman = batSwap;
      batSwap = undefined;
      return bowlCollect(batsman, bowler, dm);
    }
    
    //Switch bowler when ball ends.
    if(remainingBalls <= 0) {
      if(batExtra && (logs.bowling[bowler.id]).length > (logs.batting['0000']).length) {
        let interval = setInterval(async function () {
          if((logs.bowling[bowler.id]).length === (logs.batting['0000']).length) {
            await clearInterval(interval);
            await switchBowler();
          }
        }, 1000);
        return;
      } else {
        let interval = setInterval(async function () {
          if((logs.bowling[bowler.id]).length === (logs.batting[batsman.id]).length) {
            await clearInterval(interval);
            await switchBowler();
          }
        }, 1000);
        return;
      }
      
      function switchBowler() {
        if(totalBalls === 0) {
          console.log('total ball is 0');
          return respond('end');
        } else {
          remainingBalls += 12;
        
          let currentIndex = getIndex(bowlingTeam, bowler);
          let response = bowlingTeam[currentIndex + 1] || 'end';
          const embed = new Discord.MessageEmbed()
            .setTitle('TeamMatch')
            .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
            .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
            .setColor(embedColor)
            .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
            
          let next = '2 overs over.' + whoIsNext(response, 'bowl', extraPlayer);
          batsman.send(next, {embed});
          bowler.send(next, {embed});
          channel.send(next, {embed});
          
          if (response === 'ExtraWicket#0000') {
            response = extraPlayer;
            bowlExtra = true;
          } 
          return respond(response, batsman, bowler, 'bowl');
        }
      }
    }
    
    //Collector
    dm.awaitMessages(
        message => message.author.id === bowler.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(async messages => {
      if(isInnings2 && !oldLogs) return;
      if(isInnings2 === 'over') return;
      
      let message = messages.first();
      let content = message.content.trim().toLowerCase();
      //End
      if(content === 'end' || content === 'cancel') {
        bowler.send('You cant exit a teamMatch, if you go afk, the CPU will bat/bowl.');
        return bowlCollect(batsman, bowler, dm);
      } //Conversation
      else if (isNaN(content)) {
        batsman.send(`\`${bowler.username}:\` ` + content);
        return bowlCollect(batsman, bowler, dm);
      } //Turn based on batExtra
      else if (batExtra && logs.bowling[bowler.id].length > logs.batting['0000'].length) {
        bowler.send('Wait for the batsman to hit the previous ball');
        return bowlCollect(batsman, bowler, dm);
      } //Turn based on no batExtra
      else if (!batExtra && logs.bowling[bowler.id].length > logs.batting[batsman.id].length) {
        bowler.send('Wait for the batsman to hit the previous ball');
        return bowlCollect(batsman, bowler, dm);
      } //Limited to 6
      else if (parseInt(content) > 6) {
        bowler.send('This match is limited to 6');
        return bowlCollect(batsman, bowler, dm);
      } //Log
      else {
        if(checkTimeup.find(player => player === bowler.id)) {
          checkTimeup.splice(checkTimeup.indexOf(bowler.id), 1);
        }
        remainingBalls -= 1;
        totalBalls -= 1;
        await logs.bowling[bowler.id].push(parseInt(content));
        await bowler.send(`You bowled ${content}`);
        await batsman.send('Ball is coming, hit it by typing a number');
        return bowlCollect(batsman, bowler, dm);
      }
    }).catch(async e => {
      console.log(e);
      //Push timeup and check timeups
      if(checkTimeup.length === 2) {
        return respond('forceEnd');
      } else if (!checkTimeup.find(player => player === bowler.id)) {
        checkTimeup.push(bowler.id);
      }
      //CPU auto bowl
      remainingBalls -= 1;
      totalBalls -= 1;
      let rando = ([1,2,3,4,5,6])[Math.floor([Math.random() * ([1,2,3,4,5,6]).length])];
      await logs.bowling[bowler.id].push(parseInt(rando));
      await bowler.send(`CPU bowled ${rando}`);
      await batsman.send('Ball is coming (CPU), hit it by typing a number');
      return bowlCollect(batsman, bowler, dm);
    })
  }
  
  
  function batCollect(batsman, bowler, dm) {
    if(isInnings2 && !oldLogs) return;
    if(isInnings2 === 'over') return;
    
    if(bowlSwap) {
      console.log('Bowler is swapping in batCollect');
      bowler = bowlSwap;
      bowlSwap = undefined;
      return batCollect(batsman, bowler, dm);
    }
    //Collector
    dm.awaitMessages(
        message => message.author.id === batsman.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(async messages => {
      if(isInnings2 && !oldLogs) return;
      if(isInnings2 === 'over') return;
      
      let message = messages.first();
      let content = message.content.trim().toLowerCase();
      let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1 ];
      let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
      if(batExtra === true) oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
      
      //End
      if(content === 'end' || content === 'cancel') {
        batsman.send('You cant exit a teamMatch, if you go afk, the CPU will bat/bowl.');
        return bowlCollect(batsman, bowler, dm);
      } //Conversation
      else if (isNaN(content)) {
        bowler.send(`\`${batsman.username}:\` ` + content);
        return batCollect(batsman, bowler, dm);
      } //Turn Based on batExtra
      else if (batExtra && logs.batting['0000'].length === logs.bowling[bowler.id].length) {
        batsman.send('Wait for the ball dude');
        return batCollect(batsman, bowler, dm);
      } //Turn Based on no batExtra
      else if (!batExtra && logs.batting[batsman.id].length === logs.bowling[bowler.id].length) {
        batsman.send('Wait for the ball dude');
        return batCollect(batsman, bowler, dm);
      } //Limit to 6
      else if (parseInt(content) > 6) {
        batsman.send('This match is limited to 6');
        return batCollect(batsman, bowler, dm);
      } //Wicket
      if (parseInt(content) === bowled) {
        let currentIndex = getIndex(battingTeam, batsman);
        let response = battingTeam[currentIndex + 1] || 'end';
        if (batExtra) {
          response = 'end'
        } else if (response === 'ExtraWicket#0000') {
          response = extraPlayer;
          batExtra = true;
        }
        const embed = new Discord.MessageEmbed()
          .setTitle('TeamMatch')
          .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
          .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
          .setColor(embedColor)
          .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
        let next = 'Wicket!!' + whoIsNext(response, 'bat', extraPlayer);
        await batsman.send(next, {embed});
        await bowler.send(next, {embed});
        await channel.send(next, {embed});
        return respond(response, bowler, batsman, 'bat');
      } //Target++
      else if (oldLogs && (oldScore + parseInt(content)) >= target) {
        if(batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
        else logs.batting[batsman.id].push(oldScore + parseInt(content));
        const embed = new Discord.MessageEmbed()
          .setTitle('TeamMatch')
          .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
          .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
          .setColor(embedColor)
          .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
        let next = 'Batting Team Won';
        batsman.send(next, {embed});
        bowler.send(next, {embed});
        channel.send(next, {embed});
        return respond('win');
      } //Log
      else {
        if(checkTimeup.find(player => player === batsman.id)) {
          checkTimeup.splice(checkTimeup.indexOf(batsman.id), 1);
        }
        //Push the scores
        if(batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
        else logs.batting[batsman.id].push(oldScore + parseInt(content));
        
        const embed = new Discord.MessageEmbed()
          .setTitle('TeamMatch')
          .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
          .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
          .setColor(embedColor)
          .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
        
        let send = `The batsman hit ${content}, was bowled ${bowled}.`
        await batsman.send(send, {embed});
        await bowler.send(send, {embed});
        await channel.send(send, {embed});
        return batCollect(batsman, bowler, dm);
      }
    }).catch(async e => {
      console.log(e);
      if(checkTimeup.length === 2) {
        return respond('forceEnd');
      } else if (!checkTimeup.find(player => player === bowler.id)) {
        checkTimeup.push(bowler.id);
      }
      
      if(isInnings2 && !oldLogs) return;
      if(isInnings2 === 'over') return;
      
      //CPU auto hit
      let rando = ([1,2,3,4,5,6])[Math.floor([Math.random() * ([1,2,3,4,5,6]).length])];
      let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
      if (batExtra) {
        oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
        (logs.batting['0000']).push(oldScore + parseInt(rando));
      } else {
        (logs.batting[batsman.id]).push(oldScore + parseInt(rando));
      }
      
      const embed = new Discord.MessageEmbed()
        .setTitle('TeamMatch')
        .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
        .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
        .setColor(embedColor)
        .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
        
      //Wicket
      let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1 ];
      if(bowled === rando) {
        let currentIndex = getIndex(battingTeam, batsman);
        let response = battingTeam[currentIndex + 1] || 'end';
        if(batExtra === true) {
          response = 'end'
        } else if (response === 'ExtraWicket#0000') {
          response = extraPlayer;
          batExtra = true;
        }
        let next = 'Wicket!!' + whoIsNext(response, 'bat', extraPlayer);
        batsman.send(next, {embed});
        bowler.send(next, {embed});
        channel.send(next, {embed});
        return respond(response, bowler, batsman, 'bat');
      } //Target++
      else if (oldLogs && (oldScore + parseInt(rando)) >= target) {
        if(batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
        else logs.batting[batsman.id].push(oldScore + parseInt(content));
        const embed = new Discord.MessageEmbed()
        let next = 'Batting Team Won';
        batsman.send(next, {embed});
        bowler.send(next, {embed});
        channel.send(next, {embed});
        return respond('win');
      } 
      
      let send = `The batsman hit ${rando} (cpu), was bowled ${bowled}.`
      await batsman.send(send, {embed});
      await bowler.send(send, {embed});
      await channel.send(send, {embed});
      return batCollect(batsman, bowler, dm);
    });
  }
}

function getIndex(team, player) {
  let index = team.indexOf(team.find(member => member.id === player.id));
  return index;
}

function whoIsNext(res, type, extraPlayer) {
  if(res === 'end') {
    if(isInnings2) return ' BowlingTeam Won'
    return ' Second Innings Starts';
  } else {
    if(type === 'bat') {
      return ` Next batsman is ${res.tag || extraPlayer.tag + ' (EW)'}`;
    } else {
      return ` Next bowler is ${res.tag || extraPlayer.tag + ' (EW)'}`;
    }
  }
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  
  if(Array.isArray(a)) {
    for(const b of a) {
      await db.findOneAndUpdate({_id: b.id}, { $set: {status: boolean}});
    }
  } else {
    await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
  }
}