const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('./getEmbedColor.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBags = require('./updateBag.js');

module.exports = async (players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel) => {
  let logs = {
    batting: {},
    bowling: {},
  };
  
  function getPlayerTagWithLogs(team, type, cap) {
    let playerAndLog = [];
    team.forEach(player => {
      let log = (logs[type])[player.id || '0000'];
      if(player.id === cap.id) {
        playerAndLog.push(`${player.tag + ' (captain)'} ${ log[log.length - 1] }`);
      } else {
        playerAndLog.push(`${player.tag || `${extraPlayer.tag} (EW)`} ${ log[log.length - 1] }`);
      }
    });
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
    .setFooter(`${remainingBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
  
  await channel.send(embed);
  await startInnings1();
  
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
  
  let useDot = false;
  let dotsUsed = 0;
  let useMagik = [false, 1];
  let bowlExtra = false;
  let batExtra = false;
  
  function bowlCollect(batsman, bowler, dm) {
    console.log('remainingBalls', remainingBalls);
    if(remainingBalls === 0) {
      if(bowlExtra === true) {
        return respond('end', batsman, 'bowl', dm);
      } else {
        let currentIndex = getIndex(bowlingTeam, bowler);
        let response = bowlingTeam[currentIndex + 1] || 'end';
        if (response !== 'end') {
          remainingBalls = 12;
        } else if (response === 'ExtraWicket#0000') {
          response = extraPlayer;
          bowlExtra = true;
        }
      }
      return respond(response, batsman, 'bowl');
    }
    //Collector
    dm.awaitMessages(
        message => message.author.id === bowler.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(async messages => {
      let message = messages.first();
      let content = message.content.trim().toLowerCase();
        
      //Check Powerup
      if (content.includes('magikball') || content.includes('magik') || content == 'mb') {
        if(logs.bowler[bowler.id].length > logs.batting[batsman.id].length) {
          bowler.send('Wait for the batsman to hit your previous ball');
          return bowlCollect(batsman, bowler, dm);
        } else if(batArray[batArray.length - 1] < 49) {
          bowler.send('Magik ball can only be used if the batsman score is above 49');
          return bowlCollect(batsman, bowler, dm);
        } else if(useMagik[0] === true) {
          bowler.send('You have already used magikball in this match.');
          return bowlCollect(batsman, bowler, dm);
        }
        const bal = await updateBag('magikball', 1, await db.findOne({_id: bowler.id}), { channel: bowler });
        if(bal === 'err') {
          return bowlCollect(batsman, bowler, dm);
        }
        let magikRando = availableRando[Math.floor(Math.random() * ([1, 2, 3, 4, 5]).length)];
        let bowledMagik = await letBowlerChooseMagik(magikRando, bowler, batsman);
        useMagik = [true, magikRando];
        (logs.bowling[bowler.id]).push(bowledMagik);
        return bowlCollect(batsman, bowler, dm);
      } //Conversation
      else if (isNaN(content)) {
        batsman.send(content);
        return bowlCollect(batsman, bowler, dm);
      } //End
      else if(content === 'end' || content === 'cancel') {
        channel.send('You cant exit a teamMatch, if you go afk, the CPU will bat/bowl.');
        return bowlCollect(batsman, bowler, dm);
      } //Turn based
      else if (logs.bowling[bowler.id].length > logs.batting[batsman.id].length) {
        bowler.send('Wait for the batsman to hit the previous ball');
        return bowlCollect(batsman, bowler, dm);
      } //Limited to 6
      else if (parseInt(content) > 6) {
        bowler.send('This match is limited to 6');
        return bowlCollect(batsman, bowler, dm);
      } //Log
      else {
        remainingBalls -= 1;
        await logs.bowling[bowler.id].push(parseInt(content));
        await bowler.send(`You bowled ${content}`);
        await batsman.send('Ball is coming, hit it by typing a number');
        return bowlCollect(batsman, bowler, dm);
      }
    }).catch(async e => {
      //CPU auto bowl
      remainingBalls -= 1;
      let rando = ([1,2,3,4,5,6])[Math.floor([Math.random() * ([1,2,3,4,5,6]).length])];
      await logs.bowling[bowler.id].push(parseInt(rando));
      await bowler.send(`CPU bowled ${rando}`);
      await batsman.send('Ball is coming, hit it by typing a number');
      return bowlCollect(batsman, bowler, dm);
    });
  }
  
  
  function batCollect(batsman, bowler, dm) {
    //Collector
    dm.awaitMessages(
        message => message.author.id === batsman.id,
        { max: 1, time: 20000, errors: ['time'] }
    ).then(async messages => {
      let message = messages.first();
      let content = message.content.trim().toLowerCase();
      let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1 ];
      let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
      if(batExtra === true) oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
      
      //End
      if(content === 'end' || content === 'cancel') {
        channel.send('You cant exit a teamMatch, if you go afk, the CPU will bat/bowl.');
        return bowlCollect(batsman, bowler, dm);
      } //Conversation
      else if (isNaN(content)) {
        bowler.send(content);
        return batCollect(batsman, bowler, dm);
      } //Turn Based
      else if (logs.batting[batsman.id].length === logs.bowling[bowler.id].length) {
        batsman.send('Wait for the ball dude');
        return batCollect(batsman, bowler, dm);
      } //Limit to 6
      else if (parseInt(content) > 6) {
        batsman.send('This match is limited to 6');
        return batCollect(batsman, bowler, dm);
      } //Dot
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
      } //Magik Ball
      else if (useMagik[0] === true && useMagik[1] > 0) {
        let magik = useMagik[1];
        if (parseInt(c) !== parseInt(magik) && parseInt(c) !== parseInt(magik + 1)) {            batsman.send(`You are compelled to use only ${magik} or ${magik + 1} by the magikball.`);
          return batCollect(batsman, bowler, dm);
        }
        useMagik = [true, -1];
      } //Wicket
      if (parseInt(content) === bowled && useDot === false) {
        batsman.send('Wicket!!');
        bowler.send('Wicket!!');
        channel.send('Wicket!!');
        
        if(batExtra === true) {
          return respond('end', bowler, 'bat', dm);
        } else {
          let currentIndex = getIndex(battingTeam, batsman);
          let response = battingTeam[currentIndex + 1] || 'end';
          if (batExtra === true) {
            response = 'end'
          } else if (response === 'ExtraWicket#0000') {
            response = extraPlayer;
            batExtra = true;
          }
          return respond(response, bowler, 'bat');
        }
      } //Log
      else {
        if(batExtra === true) {
          logs.batting['0000'].push(oldScore + parseInt(content));
        } else {
          logs.batting[batsman.id].push(oldScore + parseInt(content));
        }
        const embed = new Discord.MessageEmbed()
          .setTitle('TeamMatch')
          .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
          .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
          .setColor(embedColor)
          .setFooter(`${remainingBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
    
        await batsman.send(embed);
        await bowler.send(embed);
        await channel.send(embed);
        return batCollect(batsman, bowler, dm);
      }
    }).catch(async e => {
      //CPU auto hit
      let rando = ([1,2,3,4,5,6])[Math.floor([Math.random() * ([1,2,3,4,5,6]).length])];
      let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
      if (batExtra === true) {
        oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
        ((logs.batting)['0000']).push(oldScore + parseInt(content));
      } else {
        (logs.batting[batsman.id]).push(oldScore + parseInt(content));
      }
      
      //Wicket
      let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1 ];
      if(bowled === rando) {
        batsman.send('Wicket!!');
        bowler.send('Wicket!!');
        channel.send('Wicket!!');
        
        if(batExtra === true) {
          return respond('end', bowler, 'bat', dm);
        } else {
          let currentIndex = getIndex(battingTeam, batsman);
          let response = battingTeam[currentIndex + 1] || 'end';
          if(batExtra === true) {
            response = 'end'
          } else if (response === 'ExtraWicket#0000') {
            response = extraPlayer;
            batExtra = true;
          }
          return respond(response, bowler, 'bat');
        }
      }
      
      const embed = new Discord.MessageEmbed()
        .setTitle('TeamMatch')
        .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
        .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
        .setColor(embedColor)
        .setFooter(`${remainingBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
       
      await batsman.send(embed);
      await bowler.send(embed);
      await channel.send(embed);
      return batCollect(batsman, bowler, dm);
    });
  }
  
  
  async function respond(response, responseX, type) {
    console.log(response);
    if(response === 'end') {
      //Second Innings
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle('TeamMatch')
        .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap))
        .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap))
        .setColor(embedColor)
        .setFooter(`${remainingBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
      channel.send(embed);
      if(type === 'bat') {
        const dm = (await response.send(`Your turn to bat`, {embed})).channel;
        return batCollect(response, responseX, dm);
      } else if(type === 'bowl') {
        const dm = (await response.send(`Your turn to bowl`, {embed})).channel;
        return bowlCollect(responseX, response, dm)
      }
    }
  }
};

async function getIndex(team, player) {
  let index = team.indexOf(team.find(member => member.id === player.id));
  console.log('index:', index);
  return index;
}

async function letBowlerChooseMagik(rando, bowler, batsman) {
  bowler.send(`MagikBall on, now bowl any one of these: ${magikRando} or ${magikRando + 1}`).then( async message => {
    const msgs = await message.channel.awaitMessages(m => m.author.id === bowler.id, 
      { time: 10000, max: 1, errors: ['time'] }
    );
    const msg = msgs.first();
    const c = msg.content.trim().toLowerCase();
    if(isNaN(c)) {
      bowler.send('enter a valid number to bowler');
      return letBowlerChooseMagik(rando, bowler, batsman);
    } else if (parseInt(c) != parseInt(rando) && parseInt(c) != parseInt(rando + 1)) {
      bowler.send(`You can only bowl ${rando} or ${rando + 1} in this magikball`);
      return letBowlerChooseMagik(rando, bowler, batsman);
    } else {
      bowler.send(`You bowled ${c} and the batsman is compelled to hit either ${rando} or ${rando + 1}`);
      batsman.send(`Oop, The bowler used ${await getEmoji('magikball')} magikball, you can now only hit ${rando} or ${rando + 1}`);
    }
    return parseInt(c);
  }).catch(e => {
    //CPU autobowl
    console.log(e);
  });
}