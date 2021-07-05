const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('../functions/getEmbedColor.js');
const getEmoji = require('../functions/getEmoji.js');
const getErrors = require('../functions/getErrors.js');
const updateBags = require('../functions/updateBag.js');
const commentry = require('./getCommentry.js');
const gainExp = require('../functions/gainExp.js');

module.exports = async function innings(client, players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, message, max, oldLogs, target) {
  let { channel } = message;
  let isInnings2;
  
  let results = {
    ducks: [],
    STRs: {},
    wickets: [],
  }

  start(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, oldLogs, target);

  async function start(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, oldLogs, target) {
    let checkTimeup = [];
    let battingTime = 45000;
    let bowlingTime = 45000;
    let batFieldName = `${await getEmoji(battingCap.team.toLowerCase())} **${battingCap.team}** - Batting`
    let bowlFieldName = `${await getEmoji(bowlingCap.team.toLowerCase())} **${bowlingCap.team}** - Bowling`

    lookForEndMessages(players, battingCap, bowlingCap, channel);

    let logs = {
      batting: {},
      bowling: {},
      currentBalls: 0,
    };

    //Push to Logs and get Tags
    let battingTeamTags = [];
    let bowlingTeamTags = [];
    battingTeam.forEach(player => {
      player.id === battingCap.id ?
        battingTeamTags.push(player.tag + ' (captain)') :
        battingTeamTags.push(player.tag || `${extraPlayer.username} (EW)`)

      logs.batting[player.id || '0000'] = [0];
    });
    bowlingTeam.forEach(player => {
      player.id === bowlingCap.id ?
        bowlingTeamTags.push(player.tag + ' (captain)') :
        bowlingTeamTags.push(player.tag || `${extraPlayer.username} (EW)`)

      logs.bowling[player.id || '0000'] = [0];
    });

    let totalBalls = (bowlingTeam.length) * 2 * 6;
    let remainingBalls = 12;

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

    let teamScore = 0;
    let bowlExtra;
    let batExtra;
    let batSwap;
    let bowlSwap;

    const embed = new Discord.MessageEmbed()
      .setTitle('TeamMatch')
      .addField(batFieldName,
        getPlayerTagWithLogs(battingTeam, 'batting', battingCap, battingTeam[0]))
      .addField(bowlFieldName,
        getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowlingTeam[0]))
      .setColor(embedColor)
      .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
    channel.send(embed);
    startInnings();

    //Core
    async function respond(response, responseX, oldResponse, type) {
      checkTimeup = [];
      battingTime = 45000;
      bowlingTime = 45000;

      if (typeof(response) === 'string' && response.startsWith('forceEnd')) {
        isInnings2 = 'over';
        await changeStatus(players, false)
        await channel.send(response);
        return;
      }

      let batsmanID = !batExtra ? (type === 'bat' ? oldResponse : responseX).id :
        '0000'
      let bowlerID = type === 'bat' ? responseX.id :
        oldResponse.id

      if (type === 'bat') {
        let finalScore = logs.batting[batsmanID][logs.batting[batsmanID].length - 1];

        // if duck else wickets
        if (logs.batting[batsmanID].length === 1) results.ducks.push(responseX);
        else results.wickets.push(responseX)

        // update strikeRate logs
        if (logs.batting[batsmanID].length === 1) results.STRs[batsmanID] = [logs.batting[batsmanID].length - 1, logs.currentBalls, logs.batting[batsmanID]];
        logs.batting[batsmanID] = [finalScore];
        logs.bowling[bowlerID] = [0]
        logs.currentBalls = 0
      } else {
        let finalScore = logs.batting[batsmanID][logs.batting[batsmanID].length - 1];

        logs.batting[batsmanID] = [finalScore];
        logs.bowling[bowlerID] = [0]
      }

      //Innings One
      if (!oldLogs) {
        if (response === 'end') {
          if (isInnings2) return;
          isInnings2 = true;
          
          let batsmen = Object.keys(logs.batting);
          let bowlers = Object.keys(logs.bowling);
          batsmen.forEach(batsman => {
            logs.batting[batsman] = [logs.batting[batsman][logs.batting[batsman].length - 1]];
          });
          bowlers.forEach(bowler => {
            logs.bowling[bowler] = [0];
          });

          return start(players, bowlingTeam, battingTeam, bowlingCap, battingCap, extraPlayer, channel, logs, teamScore);
        } else {
          if (type === 'bat') {
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, response))
              .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, responseX))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            const dm = (await response.send(`Your turn to bat`, {
              embed
            })).channel;
            batSwap = response;
            return batCollect(response, responseX, dm);
          } else if (type === 'bowl') {
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, responseX))
              .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, response))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            bowlSwap = response;
            const dm = (await bowlSwap.send(`Your turn to bowl`, {
              embed
            })).channel;
            return bowlCollect(responseX, response, dm);
          }
        }
      }
      //Innings Two
      else {
        if (response === 'end') {
          isInnings2 = 'over';
          const randoCoins = parseInt((Math.random() * 696) / 1.5);
          await changeStatus(players, false)
          //rewards for bowlingTeam
          return rewards(channel, bowlingTeam, battingTeam, oldLogs, logs, randoCoins, results);
        } else if (response === 'win') {
          isInnings2 = 'over';
          const randoCoins = parseInt((Math.random() * 696) / 1.5);
          await changeStatus(players, false)
          //rewards for battingTeam
          return rewards(channel, battingTeam, bowlingTeam, oldLogs, logs, randoCoins, results);
        } else {
          if (type === 'bat') {
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, response))
              .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, responseX))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            batSwap = response
            const dm = (await batSwap.send(`Your turn to bat`, {
              embed
            })).channel;
            return batCollect(response, responseX, dm);
          } else {
            bowlSwap = response
            const dm = (await bowlSwap.send(`Your turn to bowl`, {
              embed
            })).channel;
            return bowlCollect(responseX, response, dm);
          }
        }
      }
    }

    function bowlCollect(batsman, bowler, dm) {
      if (isInnings2 === 'over') return;
      if (!oldLogs && isInnings2) return;

      //Swap the batsman if wicket
      if (batSwap) {
        batsman = batSwap;
        batSwap = undefined;
        return bowlCollect(batsman, bowler, dm);
      }

      //Switch bowler when 2 overs ends.
      if (remainingBalls === 0) {
        if (batExtra && (logs.bowling[bowler.id]).length > (logs.batting['0000']).length) {
          let interval = setInterval(async function() {
            if ((logs.bowling[bowler.id]).length === (logs.batting['0000']).length) {
              await clearInterval(interval);
              if (isInnings2 && !oldLogs) {}
              else await switchBowler();
            }
          }, 1000);
        } else {
          let interval = setInterval(async function() {
            if ((logs.bowling[bowler.id]).length === (logs.batting[batsman.id]).length) {
              await clearInterval(interval);
              if (isInnings2 && !oldLogs) {}
              else {
                if (batSwap) {
                  batsman = batSwap;
                  batSwap = undefined;
                }
                await switchBowler();
              }
            }
          }, 1000);
          return;
        }
        return;

        function switchBowler() {
          if (totalBalls === 0) {
            return respond('end', batsman, bowler, 'bowl');
          } else {
            remainingBalls += 12;

            let currentIndex = getIndex(bowlingTeam, bowler);
            let response = bowlingTeam[currentIndex + 1] || 'end';
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
              .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            let next = '2 overs over.' + whoIsNext(response, 'bowl', extraPlayer, isInnings2);
            batsman.send(next, {
              embed
            });
            bowler.send(next, {
              embed
            });
            channel.send(next, {
              embed
            });

            if (response === 'ExtraWicket#0000') {
              response = extraPlayer;
              bowlExtra = true;
            }

            if (batSwap) {
              batsman = batSwap;
              batSwap = undefined;
            }
            return respond(response, batsman, bowler, 'bowl');
          }
        }
      }

      //Collector
      dm.awaitMessages(
        message => message.author.id === bowler.id, {
          max: 1,
          time: bowlingTime,
          errors: ['time']
        }
      ).then(async messages => {
        if (isInnings2 === 'over') return;
        if (!oldLogs && isInnings2) return;

        //Clear Timeup logs
        if (checkTimeup.find(player => player === bowler.id)) {
          bowlingTime = 45000;
          checkTimeup.splice(checkTimeup.indexOf(bowler.id), 1);
        }

        let message = messages.first();
        let content = message.content.trim().toLowerCase();

        //End
        if (content === 'end' || content === 'cancel') {
          bowler.send('Only team captains should type `e.hc x` in the channel to end.');
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
        } //Limited to max
        else if (parseInt(content) > max || parseInt(content) <= 0) {
          bowler.send('This match is limited to 6');
          return bowlCollect(batsman, bowler, dm);
        } //Log
        else {
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
        if (checkTimeup.length === 2) {
          return respond(`forceEnd: Both ${batsman.username} and ${bowler.username} were afk.`);
        } else if (checkTimeup.find(player => player === bowler.id)) {
          bowlingTime = 5000;
          channel.send(`Looks like **${bowler.username}** is afk, CPU is going to instant bowl.`);
        } else {
          checkTimeup.push(bowler.id);
        }

        if (isInnings2 === 'over') return;
        if (!oldLogs && isInnings2) return;

        //Turn based on batExtra
        if (batExtra && logs.bowling[bowler.id].length > logs.batting['0000'].length) {
          return bowlCollect(batsman, bowler, dm);
        } //Turn based on no batExtra
        else if (!batExtra && logs.bowling[bowler.id].length > logs.batting[batsman.id].length) {
          return bowlCollect(batsman, bowler, dm);
        }
        //CPU auto bowl
        remainingBalls -= 1;
        totalBalls -= 1;
        let rando = ([1, 2, 3, 4, 5, 6])[Math.floor([Math.random() * ([1, 2, 3, 4, 5, 6]).length])];
        await logs.bowling[bowler.id].push(parseInt(rando));
        await bowler.send(`CPU bowled ${rando}`);
        await batsman.send('Ball is coming (CPU), hit it by typing a number');
        return bowlCollect(batsman, bowler, dm);
      })
    }

    function batCollect(batsman, bowler, dm) {
      if (isInnings2 === 'over') return;
      if (!oldLogs && isInnings2) return;

      if (bowlSwap) {
        bowler = bowlSwap;
        bowlSwap = undefined;
        return batCollect(batsman, bowler, dm);
      }

      //Collector
      dm.awaitMessages(
        message => message.author.id === batsman.id, {
          max: 1,
          time: battingTime,
          errors: ['time']
        }
      ).then(async messages => {
        if (isInnings2 === 'over') return;
        if (!oldLogs && isInnings2) return;

        //Clear Timeup logs
        if (checkTimeup.find(player => player === batsman.id)) {
          battingTeam = 45000;
          checkTimeup.splice(checkTimeup.indexOf(batsman.id), 1);
        }

        let message = messages.first();
        let content = message.content.trim().toLowerCase();
        let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1];
        let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
        if (batExtra) oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];

        //End
        if (content === 'end' || content === 'cancel') {
          batsman.send('Only team captains should type `e.hc x` in the channel to end.');
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
        } //Limit to max
        else if (parseInt(content) > max || parseInt(content) <= 0) {
          batsman.send('This match is limited to 6');
          return batCollect(batsman, bowler, dm);
        }
        logs.currentBalls += 1;
        //Wicket
        if (parseInt(content) === bowled) {
          let currentIndex = getIndex(battingTeam, batsman);
          let response = battingTeam[currentIndex + 1] || 'end';
          if (batExtra) {
            response = 'end'
          } else if (response === 'ExtraWicket#0000') {
            response = extraPlayer;
            batExtra = true;
          }
          if (bowlSwap) {
            bowler = bowlSwap;
            bowlSwap = undefined;
          }

          const embed = new Discord.MessageEmbed()
            .setTitle('TeamMatch')
            .setDescription(await commentry(bowled, 'W'))
            .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
            .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
            .setColor(embedColor)
            .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
          let next = '☝️ Wicket!!' + whoIsNext(response, 'bat', extraPlayer, isInnings2);
          await batsman.send(next, {
            embed
          });
          await bowler.send(next, {
            embed
          });
          await channel.send(next, {
            embed
          });
          return respond(response, bowler, batsman, 'bat');
        } //Target++
        else if (oldLogs && teamScore + parseInt(content) >= target) {
          if (batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
          else logs.batting[batsman.id].push(oldScore + parseInt(content));

          teamScore += parseInt(content);
          const embed = new Discord.MessageEmbed()
            .setTitle('TeamMatch')
            .setDescription(await commentry(bowled, parseInt(content)))
            .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
            .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
            .setColor(embedColor)
            .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
          let next = '🔥 Batting Team Won';
          batsman.send(next, {
            embed
          });
          bowler.send(next, {
            embed
          });
          channel.send(next, {
            embed
          });
          return respond('win', bowler, batsman, 'bat');
        } //Log
        else {
          //Push the scores
          if (batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
          else logs.batting[batsman.id].push(oldScore + parseInt(content));

          teamScore += parseInt(content);
          const embed = new Discord.MessageEmbed()
            .setTitle('TeamMatch')
            .setDescription(await commentry(bowled, parseInt(content)))
            .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
            .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
            .setColor(embedColor)
            .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
          let send = `The batsman hit ${content}, was bowled ${bowled}.`
          await batsman.send(send, {
            embed
          });
          await bowler.send(send, {
            embed
          });
          await channel.send(send, {
            embed
          });
          return batCollect(batsman, bowler, dm);
        }
      }).catch(async e => {
        console.log(e);

        if (checkTimeup.length === 2) {
          return respond(`forceEnd: Both ${batsman.username} and ${bowler.username} were afk.`);
        } else if (checkTimeup.find(player => player === batsman.id)) {
          battingTime = 5000;
          channel.send(`Looks like **${batsman.username}** is afk, CPU is going to instant hit the balls.`);
        } else {
          checkTimeup.push(batsman.id);
        }

        let bowled = (logs.bowling[bowler.id])[(logs.bowling[bowler.id]).length - 1];

        if (isInnings2 && !oldLogs) return;
        if (isInnings2 === 'over') return;

        //Turn Based on batExtra
        if (batExtra && logs.batting['0000'].length === logs.bowling[bowler.id].length) {
          return batCollect(batsman, bowler, dm);
        } //Turn Based on no batExtra
        else if (!batExtra && logs.batting[batsman.id].length === logs.bowling[bowler.id].length) {
          return batCollect(batsman, bowler, dm);
        }

        logs.currentBalls += 1;
        //CPU auto hit
        let rando = ([1, 2, 3, 4, 5, 6])[Math.floor([Math.random() * ([1, 2, 3, 4, 5, 6]).length])];
        let oldScore = (logs.batting[batsman.id])[(logs.batting[batsman.id]).length - 1];
        if (batExtra) {
          oldScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
          (logs.batting['0000']).push(oldScore + parseInt(rando));
        } else {
          (logs.batting[batsman.id]).push(oldScore + parseInt(rando));
        }

        teamScore += parseInt(rando);
        const embed = new Discord.MessageEmbed()
          .setTitle('TeamMatch')
          .setDescription(await commentry(bowled, rando))
          .addField(batFieldName, getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
          .addField(bowlFieldName, getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
          .setColor(embedColor)
          .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

        //Wicket
        if (bowled === rando) {
          teamScore -= parseInt(rando);
          if (batExtra) {
            logs.batting['0000'].pop()
          } else {
            logs.batting[batsman.id].pop()
          }
          let currentIndex = getIndex(battingTeam, batsman);
          let response = battingTeam[currentIndex + 1] || 'end';
          if (batExtra === true) {
            response = 'end'
          } else if (response === 'ExtraWicket#0000') {
            response = extraPlayer;
            batExtra = true;
          }
          let next = 'Wicket!!' + whoIsNext(response, 'bat', extraPlayer, isInnings2);
          batsman.send(next, {
            embed
          });
          bowler.send(next, {
            embed
          });
          channel.send(next, {
            embed
          });
          return respond(response, bowler, batsman, 'bat');
        } //Target++
        else if (oldLogs && teamScore + parseInt(rando) >= target) {
          if (batExtra) logs.batting['0000'].push(oldScore + parseInt(rando));
          else logs.batting[batsman.id].push(oldScore + parseInt(rando));
          const embed = new Discord.MessageEmbed()
          let next = 'Batting Team Won';
          batsman.send(next, {
            embed
          });
          bowler.send(next, {
            embed
          });
          channel.send(next, {
            embed
          });
          return respond('win', bowler, batsman, 'bat');
        }

        let send = `The batsman hit ${rando} (cpu), was bowled ${bowled}.`
        await batsman.send(send, {
          embed
        });
        await bowler.send(send, {
          embed
        });
        await channel.send(send, {
          embed
        });
        return batCollect(batsman, bowler, dm);
      });
    }

    function getPlayerTagWithLogs(team, type, cap, current) {
      let playerAndLog = [];
      
      team.forEach(player => {
        let log = logs[type][player.id || '0000'];
        let { id, username } = player;
        if (id === current.id) username = `__${username}__`
        
        let name = 
          batExtra ?
            `${username} (EW)` :
          id === cap.id ?
            `${username} (cap)` :
          `${username}`
        
        let playerHistory = results.STRs[player.id || '0000']
        let balls = playerHistory ? playerHistory[1] :
                    (id === current.id ? logs.currentBalls : 0)
        console.log(balls, playerHistory)
        playerAndLog.push(name + `     ${log[log.length -1] || 0} (${(balls/6).toFixed(0)}.${balls % 6})`)
      });
      
      if (type === 'batting' && oldLogs) {
        playerAndLog.push(`**${target}** is the Target Score, more **${target - teamScore}** runs left.`);
      }
      return playerAndLog.join(`\n`);
    }
    
    async function lookForEndMessages(players, cap1, cap2, channel) {
      const messageCollector = channel.createMessageCollector(
        message => {
          if (message.author.bot === true) return;
          let c = message.content.toLowerCase().trim();
          if (c == 'e.hc x' || c == 'e.hc end') return true;
        }, {
          time: 30000
        }
      );

      messageCollector.on('collect', async (message) => {
        if (isInnings2 && !oldLogs) return;
        if (isInnings2 == 'over') return;

        if (message.author.id === cap1.id || message.author.id === cap2.id) {
          await respond(`forceEnd: ${message.author.tag} ended.`);
          messageCollector.stop();
        } else if (players.find(player => player.id == message.author.id)) {
          await message.reply('Only captains can end a match!');
        }
      });

      messageCollector.on('end', () => {
        if (isInnings2 && !oldLogs) return;
        if (isInnings2 == 'over') return;

        return lookForEndMessages(players, cap1, cap2, channel);
      })
    }
  }

  async function rewards(channel, wonTeam, lostTeam, i1Logs, i2Logs, randoCoins, results) {
    console.log(i1Logs, i2Logs, results)
    
    let coinEmoji = await getEmoji('coin');
    let ducks = results.ducks
    let STRs = results.STRs
    let wickets = results.wickets
    
    //PurpleCaps
    let orangeCapHolder = await getOrangeCapHolder();
    if (orangeCapHolder != '0000') {
      let orangeCapHolderData = await db.findOne({ _id: orangeCapHolder });
      if (orangeCapHolderData && orangeCapHolderData._id) {
        let oldCaps = orangeCapHolderData.orangeCaps || 0;
        await db.findOneAndUpdate({ _id: orangeCapHolder }, {
          $set: {
            orangeCaps: oldCaps + 1
          }
        });
        console.log('orange', orangeCapHolder);
      }

      let rewardsEmbed = new Discord.MessageEmbed()
        .setTitle('Rewards')
        .addField(
          'Coins',
          `${coinEmoji} ${randoCoins} for ${wonTeam[0].username}'s team\n` +
          `${coinEmoji} ${parseInt(randoCoins/3)} for ${lostTeam[0].username}'s team`
        )
        .addField('OrangeCap Holder', (await client.users.fetch(orangeCapHolder)).username)
        .setFooter('Legends say that they have noticed many other rewards!')
        .setColor(embedColor);

      channel.send('Aight Guys, here are the rewards', rewardsEmbed);
    }

    async function getOrangeCapHolder() {
      let inningsOne = await getInningsHighestScore(i1Logs.batting);
      let inningsTwo = await getInningsHighestScore(i2Logs.batting);

      if (inningsOne[1] > inningsTwo[1]) {
        return inningsOne[0];
      } else {
        return inningsTwo[0];
      }
      async function getInningsHighestScore(iLogs) {
        let logs = [];
        let scores = [];
        await Object.values(iLogs).forEach(log => {
          logs.push(log);
        });
        await logs.forEach(log => {
          scores.push(log[log.length - 1]);
        });
        let highScore = Math.max(...scores);
        let capHolderId = Object.keys(iLogs).find(key => (iLogs[key])[iLogs[key].length - 1] == highScore);
        return [capHolderId, highScore];
      }
    }

    await ducks.forEach(async player => {
      let data = await db.findOne({ _id: player.id });
      if (!data) return console.log('no data for ducks');

      const quests = data.quests || {};
      quests.duck = true;

      await db.findOneAndUpdate({ _id: player.id }, {
        $set: {
          quests: quests,
        },
        $inc: {
          wickets: 1
        }
      });
    });


    await wickets.forEach(async player => {
      await db.findOneAndUpdate({ _id: player.id }, {
        $inc: {
          wickets: 1,
        }
      })
    })


    await wonTeam.forEach(async player => {
      if (typeof player !== 'object') return;

      const data = await db.findOne({ _id: player.id });
      const bal = data.cc + randoCoins;
      const wins = (data.wins || 0) + 1;
      const quests = data.quests || {};
      quests.tripWin = [(quests.tripWin || [0, '123'])[0] + 1, '123'];
      if (quests.tripWin[0] === 3) quests.tripWin = [true, '123'];

      if (!STRs[player.id]) {
        await db.findOneAndUpdate({ _id: player.id }, {
          $set: {
            cc: bal,
            wins: wins,
            quests: quests,
            coinMulti: parseFloat(data.coinMulti + 0.0069),
            tossMulti: parseFloat(data.tossMulti - 0.0069),
          }
        });
        return;
      } else {
        const STR = (data.strikeRate + STRs[player.id][0] / STRs[player.id][1]) / 2;
        const pattern = changePattern(data, STRs[player.id][2]);

        console.log(bal, wins, STR);

        const winnerSet = {
          cc: bal,
          wins: wins,
          strikeRate: STR,
          quests: quests,
          coinMulti: parseFloat(data.coinMulti + 0.0069),
          tossMulti: parseFloat(data.tossMulti - 0.0069),
          totalScore: parseInt((data.totalScore || 0) + (STRs[player.id])[0]),
          pattern: pattern,
        }

        if ((data.highScore || 0) < (STRs[player.id])[0]) {
          winnerSet.highScore = parseInt((data.highScore || 0) + (STRs[player.id])[0]);
        }

        await db.findOneAndUpdate({ _id: player.id }, {
          $set: winnerSet
        });
      }
      await gainExp(data, 7, message);
    });

    await lostTeam.forEach(async player => {
      if (typeof player !== 'object') return;

      const data = await db.findOne({ _id: player.id });
      let loses = data.loses + 1;
      let quests = data.quests || {};
      let bal = data.cc + parseInt(randoCoins / 3);
      quests.tripWin = [0, '123'];

      if (!STRs[player.id]) {
        await db.findOneAndUpdate({ _id: player.id }, {
          cc: bal,
          loses: loses,
          quests: quests,
          tossMulti: parseFloat(data.tossMulti + 0.0069),
        });
        return;
      } else {
        const STR = (data.strikeRate + STRs[player.id][0] / STRs[player.id][1]) / 2;
        const pattern = changePattern(data, STRs[player.id][2]);

        console.log(loses, STR);

        const loserSet = {
          cc: bal,
          loses: loses,
          strikeRate: STR,
          quests: quests,
          tossMulti: parseFloat(data.tossMulti + 0.0069),
          totalScore: parseInt((data.totalScore || 0) + (STRs[player.id])[0]),
          pattern: pattern,
        }

        if ((data.highScore || 0) < (STRs[player.id])[0]) {
          loserSet.highScore = parseInt((data.highScore || 0) + (STRs[player.id])[0]);
        }

        await db.findOneAndUpdate({ _id: player.id }, {
          $set: loserSet
        });
      }
      await gainExp(data, 7, message);
    });
  }
}

function getIndex(team, player) {
  let index = team.indexOf(player);
  return index;
}

function whoIsNext(res, type, extraPlayer, isInnings2) {
  if (res === 'end') {
    if (isInnings2) return ' BowlingTeam Won'
    else return ' Second Innings Starts';
  } else {
    if (type === 'bat') {
      return ` Next batsman is ${res.username || extraPlayer.username}`;
    } else {
      return ` Next bowler is ${res.username || extraPlayer.username}`;
    }
  }
}

async function changeStatus(a, boolean) {
  if (boolean !== true && boolean !== false) return;

  if (Array.isArray(a)) {
    for (const b of a) {
      await db.findOneAndUpdate({
        _id: b.id
      }, {
        $set: {
          status: boolean
        }
      });
    }
  } else {
    await db.findOneAndUpdate({
      _id: a.id
    }, {
      $set: {
        status: boolean
      }
    });
  }
}


function changePattern(data, scores) {
  let pattern = data.pattern || {}

  logs = []
  for (let i = 0; i < scores.length; i++) {
    if (i !== 0) logs.push(scores[i] - scores[i - 1])
  }

  for (let i = 0; i < logs.length; i++) {
    num = logs[i]
    pattern[num] = (pattern[num] || 0) + 1
  }

  return pattern
}