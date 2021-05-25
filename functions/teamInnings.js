const db = require('../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('./getEmbedColor.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBags = require('./updateBag.js');
const commentry = require('./getCommentry.js');

module.exports = async function innings(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, max, oldLogs, target) {
  let isInnings2;
  let ducks = [];
  let STRs = {};
  
  start(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, oldLogs, target);
  function start(players, battingTeam, bowlingTeam, battingCap, bowlingCap, extraPlayer, channel, oldLogs, target) {
    let checkTimeup = [];

    let logs = {
      batting: {},
      bowling: {},
      currentBalls: 0,
    };

    lookForEndMessages(players, battingCap, bowlingCap, channel);

    //Push to Logs and get Tags
    let battingTeamTags = [];
    let bowlingTeamTags = [];
    battingTeam.forEach(player => {
      if (player.id === battingCap.id) {
        battingTeamTags.push(player.tag + ' (captain)');
      } else {
        battingTeamTags.push(player.tag || `${extraPlayer.tag} (EW)`);
      }
      logs.batting[player.id || '0000'] = [0];
    });
    bowlingTeam.forEach(player => {
      if (player.id === bowlingCap.id) {
        bowlingTeamTags.push(player.tag + ' (captain)');
      } else {
        bowlingTeamTags.push(player.tag || `${extraPlayer.tag} (EW)`);
      }
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
      .addField('Batting Team',
        getPlayerTagWithLogs(battingTeam, 'batting', battingCap, battingTeam[0]))
      .addField('Bowling Team',
        getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowlingTeam[0]))
      .setColor(embedColor)
      .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
    channel.send(embed);
    startInnings();
    
    //Core
    async function respond(response, responseX, oldResponse, type) {
      checkTimeup = [];
      
      if (typeof response === 'string' && response.startsWith('forceEnd')) {
        isInnings2 = 'over';
        changeStatus(players, false)
        channel.send(response);
        return;
      } 
      //Innings One
      else if (!oldLogs) {
        if (response === 'end') {
          if(isInnings2) return;
          if (batExtra) {
            if((logs.batting['0000']).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
            let finalScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
            if(type === 'bat' && logs.batting['0000'].length === 1) STRs[oldResponse.id] = [finalScore, logs.currentBalls];
            logs.batting['0000'] = [finalScore];
          } else {
            if((logs.batting[oldResponse.id]).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
            let finalScore = (logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1];
            if(type === 'bat') STRs[oldResponse.id] = [finalScore, logs.currentBalls];
            logs.batting[oldResponse.id] = [finalScore];
          }
          let batsmen = Object.keys(logs.batting);
          let bowlers = Object.keys(logs.bowling);
          batsmen.forEach(batsman => {
            (logs.batting)[batsman] = [((logs.batting)[batsman])[((logs.batting)[batsman]).length - 1]];
          });
          bowlers.forEach(bowler => {
            (logs.bowling)[bowler] = [0];
          });
          isInnings2 = true;
          logs.currentBalls = 0;
          return start(players, bowlingTeam, battingTeam, bowlingCap, battingCap, extraPlayer, channel, logs, teamScore);
        } else {
          if (type === 'bat') {
            if (batExtra) {
              if((logs.batting['0000']).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
              let finalScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
              if(logs.batting['0000'].length === 1) STRs[oldResponse.id] = [finalScore, logs.currentBalls];
              logs.batting['0000'] = [finalScore];
            } else {
              if((logs.batting[oldResponse.id]).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
              let finalScore = (logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1];
              STRs[oldResponse.id] = [finalScore, logs.currentBalls];
              logs.batting[oldResponse.id] = [finalScore];
            }

            logs.bowling[responseX.id] = [0];
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, response))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, responseX))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            const dm = (await response.send(`Your turn to bat`, {
              embed
            })).channel;
            batSwap = response;
            logs.currentBalls = 0;
            return batCollect(response, responseX, dm);
          } else if (type === 'bowl') {
            logs.bowling[oldResponse.id] = [0];
            if (batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
            else logs.batting[responseX.id] = [(logs.batting[responseX.id])[(logs.batting[responseX.id]).length - 1]];

            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, responseX))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, response))
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
          if (batExtra) {
            if((logs.batting['0000']).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
            let finalScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
            if(type === 'bat' && logs.batting['0000'].length === 1) STRs[oldResponse.id] = [finalScore, logs.currentBalls];
            logs.batting['0000'] = [finalScore];
          } else {
            if((logs.batting[oldResponse.id]).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
            let finalScore = (logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1];
            if(type === 'bat') STRs[oldResponse.id] = [finalScore, logs.currentBalls];
            logs.batting[oldResponse.id] = [finalScore];
          }
          changeStatus(players, false)
          logs.currentBalls = 0;
          //rewards for bowlingTeam
          const randoCoins = Math.floor(Math.random() * 696);
          channel.send(`BowlingTeam recieved ${await getEmoji('coin')} ${randoCoins} each.`);
          return rewards(bowlingTeam, battingTeam, randoCoins, ducks, STRs);
        } else if (response === 'win') {
          isInnings2 = 'over';
          changeStatus(players, false)
          //rewards for battingTeam
          const randoCoins = Math.floor(Math.random() * 696);
          rewards(battingTeam, bowlingTeam, randoCoins, ducks, STRs);
          channel.send(`BattingTeam recieved ${await getEmoji('coin')} ${randoCoins} each.`);
        } else {
          if (type === 'bat') {
            if (batExtra) {
              if((logs.batting['0000']).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
              let finalScore = (logs.batting['0000'])[(logs.batting['0000']).length - 1];
              if(logs.batting['0000'].length === 1) STRs[oldResponse.id] = [finalScore, logs.currentBalls];
              logs.batting['0000'] = [finalScore];
            } else {
              if((logs.batting[oldResponse.id]).length === 1 && !ducks.find(player => player.id == responseX.id)) ducks.push(responseX);
              let finalScore = (logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1];
              STRs[oldResponse.id] = [finalScore, logs.currentBalls];
              logs.batting[oldResponse.id] = [(logs.batting[oldResponse.id])[(logs.batting[oldResponse.id]).length - 1]];
            }
            
            logs.bowling[responseX.id] = [0];
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, response))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, responseX))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

            batSwap = response
            const dm = (await batSwap.send(`Your turn to bat`, {
              embed
            })).channel;
            logs.currentBalls = 0;
            return batCollect(response, responseX, dm);
          } else if (type === 'bowl') {
            logs.bowling[oldResponse.id] = [0];
            if (batExtra) logs.batting['0000'] = [(logs.batting['0000'])[(logs.batting['0000']).length - 1]];
            else logs.batting[responseX.id] = [(logs.batting[responseX.id])[(logs.batting[responseX.id]).length - 1]];

            bowlSwap = response
            const dm = await (await bowlSwap.send(`Your turn to bowl`, {
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
          let interval = setInterval(async function () {
            if ((logs.bowling[bowler.id]).length === (logs.batting['0000']).length) {
              await clearInterval(interval);
              await switchBowler();
            }
          }, 1000);
        } else {
          let interval = setInterval(async function () {
            if ((logs.bowling[bowler.id]).length === (logs.batting[batsman.id]).length) {
              await clearInterval(interval);
              await switchBowler();
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
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
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
            
            if(batSwap) {
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
          time: 45000,
          errors: ['time']
        }
      ).then(async messages => {
          if (isInnings2 === 'over') return;
          if (!oldLogs && isInnings2) return;
          
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
            if ((checkTimeup.filter(player => player === bowler.id)).length !== 0) {
              (checkTimeup.filter(player => player === bowler.id)).forEach((player) => {
                checkTimeup.splice(checkTimeup.indexOf(player), 1);
              });
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
          if (checkTimeup.length === 4) {
            return respond(`forceEnd: Both ${batsman.tag} and ${bowler.tag} were afk.`);
          } else if ((checkTimeup.filter(player => player === bowler.id)).length !== 2) {
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
          time: 45000,
          errors: ['time']
        }
      ).then(async messages => {
          if (isInnings2 === 'over') return;
          if (!oldLogs && isInnings2) return;

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
            if(bowlSwap) {
              bowler = bowlSwap;
              bowlSwap = undefined;
            }
            
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .setDescription(await commentry(bowled, 'W'))
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
            let next = 'Wicket!!' + whoIsNext(response, 'bat', extraPlayer, isInnings2);
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
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
              .setColor(embedColor)
              .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);
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
            return respond('win');
          } //Log
          else {
            if ((checkTimeup.filter(player => player === batsman.id)).length !== 0) {
              (checkTimeup.filter(player => player === bowler.id)).forEach((player) => {
                checkTimeup.splice(checkTimeup.indexOf(player), 1);
              });
            }
            //Push the scores
            if (batExtra) logs.batting['0000'].push(oldScore + parseInt(content));
            else logs.batting[batsman.id].push(oldScore + parseInt(content));

            teamScore += parseInt(content);
            const embed = new Discord.MessageEmbed()
              .setTitle('TeamMatch')
              .setDescription(await commentry(bowled, parseInt(content)))
              .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
              .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
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
          if (checkTimeup.length === 4) {
            return respond(`forceEnd: Both ${batsman.tag} and ${bowler.tag} were afk.`);
          } else if ((checkTimeup.filter(player => player === batsman.id)).length !== 2) {
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
            .setDescriptiona(await commentry(bowled, rando))
            .addField('Batting Team', getPlayerTagWithLogs(battingTeam, 'batting', battingCap, batsman))
            .addField('Bowling Team', getPlayerTagWithLogs(bowlingTeam, 'bowling', bowlingCap, bowler))
            .setColor(embedColor)
            .setFooter(`${totalBalls} balls more left, Bowler changes in ${remainingBalls} balls`);

          //Wicket
          if (bowled === rando) {
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
            return respond('win');
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
    
    async function lookForEndMessages(players, cap1, cap2, channel) {
      const messageCollector = channel.createMessageCollector(
        message => {
          let c = message.content.toLowerCase().trim();
          if (message.author.bot === true) return;
          if (c == 'e.hc x' || c == 'e.hc end') return true;
        }
      )

      messageCollector.on('collect', (message) => {
        if (message.author.id === cap1.id || message.author.id === cap2.id) {
          respond(`forceEnd: ${message.author.tag} ended.`);
          messageCollector.stop();
        } else if (players.find(player => player.id == message.author.id)) {
          message.reply('Only captains can!');
        }
      });
    }

    function getPlayerTagWithLogs(team, type, cap, current) {
      let playerAndLog = [];
      team.forEach(player => {
        let log = (logs[type])[player.id || '0000'];
        let { id, username } = player;
        if (type === 'batting') {
          if (id === cap.id) {
            if (batExtra && current.id === id) playerAndLog.push(`*__${username}__* (EW)     ${ log[log.length - 1] }`);
            else if (current.id === id) playerAndLog.push(`*__${username}__* (cap)     ${ log[log.length - 1] }`);
            else playerAndLog.push(`${username} (cap)     ${log[log.length - 1]}`)
          } else if (id === current.id) {
            playerAndLog.push(`*__${username}__*     ${ log[log.length - 1] }`);
          } else {
            playerAndLog.push(`${username || `${extraPlayer.username} (EW)`}     ${ log[log.length - 1] }`);
          }
        } else {
          if (!oldLogs) {
            if (id === cap.id) {
              if (current.id === id) playerAndLog.push(`*__${username}__* (cap)     0`);
              else playerAndLog.push(`${username} (cap)     0`)
            } else if (id === current.id) {
              playerAndLog.push(`*__${username || `${extraPlayer.username} (EW)`}__*     0`);
            } else {
              playerAndLog.push(`${username || `${extraPlayer.username} (EW)`}     0`);
            }
          } else {
            if(type === 'bowling') log = (  oldLogs  [  'batting'  ]  )  [  id || '0000'  ] ;
            if (id === cap.id) {
              if (current.id === id) playerAndLog.push(`*__${username}__* (cap)     ${ log[log.length - 1] }`);
              else playerAndLog.push(`${username} (cap)     ${log[log.length - 1]}`)
            } else if (id === current.id) {
              playerAndLog.push(`*__${username || `${extraPlayer.username} (EW)`}__*     ${ log[log.length - 1] }`);
            } else {
              playerAndLog.push(`${username || `${extraPlayer.username} (EW)`}     ${ log[log.length - 1] }`);
            }
          }
        }
      });
      if (type === 'batting' && oldLogs) {
        playerAndLog.push(`${target} is the Target Score`);
      }
      return playerAndLog.join(`\n`);
    }
  }
}

function getIndex(team, player) {
  let index = team.indexOf(team.find(member => member.id === player.id));
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

async function rewards(wonTeam, lostTeam, randoCoins, ducks, STRs) {
  console.log(STRs);
  
  await ducks.forEach(async player => {
    let data = await db.findOne({ _id: player.id });
    if(!data) return console.log('no data for ducks');
    
    const quests = data.quests || {};
    quests.duck = true;
    
    await db.findOneAndUpdate({ _id: player.id }, {
      $set: {
        quests: quests,
      }
    });
  });
  
  await wonTeam.forEach(async player => {
    if(typeof player !== 'object') return;
    
    const data = await db.findOne({ _id: player.id });
    const bal = data.cc + randoCoins;
    const wins = (data.wins || 0) + 1;
    const quests = data.quests || {};
    quests.tripWin = [(quests.tripWin || [0, '123'])[0] + 1, '123'];
    if(quests.tripWin[0] === 3) quests.tripWin = [true, '123'];
    
    if(!STRs[player.id]) {
      await db.findOneAndUpdate({ _id: player.id }, {
        $set: {
          cc: bal,
          wins: wins,
          quests: quests,
        }
      });
      return;
    } else {
      const STR = ( data.strikeRate + ( STRs[player.id] [0] ) / ( STRs[player.id] [1] ) ) / 2;
      
      console.log(bal, wins, STR);
      
      await db.findOneAndUpdate({ _id: player.id }, {
        $set: {
          cc: bal,
          wins: wins,
          strikeRate: STR,
          quests: quests,
        }
      });
    }
  });
  
  await lostTeam.forEach(async player => {
    if(typeof player !== 'object') return;
    
    const data = await db.findOne({ _id: player.id });
    const loses = data.loses + 1;
    const quests = data.quests || {};
    quests.tripWin = [0, '123'];
    
    if(!STRs[player.id]) {
      await db.findOneAndUpdate({ _id: player.id }, {
        loses: loses,
        quests: quests,
      });
      return;
    } else {
      const STR = ( data.strikeRate + ( STRs[player.id] [0] ) / ( STRs[player.id] [1] ) ) / 2;
      
      console.log(loses, STR);
      
      await db.findOneAndUpdate({ _id: player.id }, {
        $set: {
          loses: loses,
          strikeRate: STR,
          quests: quests,
        }
      });
    }
  });
}