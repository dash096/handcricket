const db = require("../schemas/player.js");
const Discord = require("discord.js");
const updateBag = require('../functions/updateBag.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');
const commentry = require('./getCommentry.js');
const rewards = require('./rewards.js');

module.exports = async function(batsman, bowler, message, flags, challenge) {
  const { channel, author, mentions, content } = message;
  
  let isInnings2
  
  // flags
  let post = (challenge?.post) || flags.post || false
  let max = (challenge?.max) || flags.max || 6
  let wckts = (challenge?.wickets) || flags.wickets || 1
  let ovrs = (challenge?.overs) || flags.overs || 5
  
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
  
  if (!challenge) {
    start(batsman, bowler)
  } else {
    if (challenge.type === 'bat') {
      if (challenge.innings === 1) {
        start(challenge.player, challenge.CPU)
      } else if (challenge.innings === 2)  {
        isInnings2 = true
        start(challenge.player, challenge.CPU, challenge.oldLogs)
      }
    } else if (challenge.type === 'bowl') {
      if (challenge.innings === 1) {
        start(challenge.CPU, challenge.player)
      } else if (challenge.innings === 2)  {
        isInnings2 = true
        start(challenge.CPU, challenge.player, challenge.oldLogs)
      }
    }
  }
  
  async function start(batsman, bowler, oldLogs) {
    let target = oldLogs ? oldLogs.batArray.slice(-1)[0] + 1 : undefined
    let targetIn = oldLogs ? oldLogs.ballArray.length - 1 : undefined
    let noOfUsedDots = 0;
    
    let wickets = wckts;
    let remainingBalls = ovrs * 6;
    
    const batArray = [(challenge || {}).currentScore || 0];
    const ballArray = [0];

    const embed = new Discord.MessageEmbed()
      .setTitle("Cricket Match")
      .addField(batsman.username + " - Batting", `**Score:**      ${challenge?.currentScore || 0} (${ballArray.length - 1})\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
      .addField(bowler.username + " - Bowling", `${target || 0} (${targetIn || 0})`, true)
      .setColor(embedColor);
    if (challenge) embed.setFooter(challenge.info)
    
    try {
      batsman.send(embed);
    } catch (e) {
      console.log(e);
      isInnings2 = 'over'
      changeStatus(batsman, bowler);
      message.reply(`Cant send message to ${batsman}`);
      return;
    }
    try {
      bowler.send(embed);
    } catch (e) {
      console.log(e);
      isInnings2 = 'over'
      changeStatus(batsman, bowler);
      message.reply(`Cant send message to ${bowler}`);
      return;
    }
    if (post === true) await channel.send(embed);

    loopBallCollect();
    loopBatCollect();

    async function loopBallCollect() {
      if (isInnings2 == 'over') return;
      if (isInnings2 && !target) return;
      
      if (remainingBalls === 0) {
        const comment = await commentry('O');
        const embed = new Discord.MessageEmbed()
          .setTitle("Cricket Match")
          .setDescription(comment)
          .addField(batsman.username + " - Batting", `**Score:**      ${batArray.slice(-1)[0]} (${ballArray.length - 1})\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
          .addField(bowler.username + " - Bowling", `${target || 0} (${targetIn || 0})`, true)
          .setColor(embedColor);
        if (challenge) embed.setFooter(challenge.info)
        
        let interval = setInterval(async () => {
          if (batArray.length !== ballArray.length) {
            return;
          }
          
          clearInterval(interval);
          if (isInnings2) {
            isInnings2 = 'over';
            const coins = Math.floor(Math.random() * 345 * ((await db.findOne({ _id: bowler.id }) || {}).coinMulti || 0.2));
            bowler.send(`${ovrs} overs over. You won and looted ${await getEmoji('coin')} ${coins}!`);
            batsman.send(`${ovrs} overs over. You lost`);
            if (post === true) channel.send(`${ovrs} overs over. Bowler won!`);
            changeStatus(batsman, bowler);
            return rewards(bowler, batsman, coins, oldLogs, {
              'batArray': batArray,
              'ballArray': ballArray,
            }, message, challenge);
          } else {
            isInnings2 = true;
            bowler.send(`${ovrs} overs over. Second Innings starts!`);
            batsman.send(`${ovrs} overs over. Second Innings starts!`);
            if (post === true) channel.send(`${ovrs} overs over. Second Innings starts!`);
            if (!challenge || (challenge?.doubleInnings)) return start(bowler, batsman, {
              'batArray': batArray,
              'ballArray': ballArray,
            });
          }
        }, 1 * 1000);
        return;
      }
      
      try {
        let m
        if (bowler.id === 'CPU') {
          await sleep(5000)
          let random = await cpuBowl(challenge.player, batArray)
          m = { 'content': `${random}` }
        } else {
          m = (await bowler.dmChannel.awaitMessages(
            m => m.author.id === bowler.id,
            { max: 1, time: 60000, errors: ["time"] }
          )).first()
        }
        if (isInnings2 == 'over') return;
        if (isInnings2 && !target) return;
        
        let c = m.content.toLowerCase().trim();
        
        //End the match
        if (c == 'end' || c == 'e.hc end' || c == 'e.hc x') {
          isInnings2 = 'over';
          let text = `**${bowler.username}** forfeited`
          batsman.send(text);
          bowler.send(text);
          if (post === true) channel.send(text);
          await changeStatus(batsman, bowler);
          return;
        } //Communication
        else if (isNaN(c)) {
          batsman.send(`\`${bowler.username}\`: ${c}`);
          return loopBallCollect();
        } //Number Validation
        else if (parseInt(c) > max || parseInt(c) < 0) {
          bowler.send("Max number that can be bowled is 6");
          return loopBallCollect();
        } //Turn based
        else if (batArray.length < ballArray.length) {
          bowler.send("Wait for the batsman to hit the previous ball.");
          return loopBallCollect();
        } //Push
        else {
          remainingBalls -= 1;
          ballArray.push(parseInt(c));
          await bowler.send("You bowled " + c);
          await batsman.send("Ball is coming, hit it by typing a number.");
          return loopBallCollect();
        }
      } catch (e) {
        console.log(e);
        
        if (isInnings2 == 'over') return;
        if (isInnings2 && !target) return;
        
        isInnings2 = 'over';
        bowler.send("Match ended as you were inactive");
        batsman.send("Match ended as the bowler was inactive");
        if (post === true) channel.send(`Match ended due to inactivity.. Sadge`);
        changeStatus(batsman, bowler);
        return;
      }
    }

    async function loopBatCollect() {
      if (isInnings2 == 'over') return;
      if (isInnings2 && !target) return;
      
      try {
        let m
        
        if (batsman.id === 'CPU') {
          await sleep(5000)
          let random = Math.floor(Math.random() * 7)
          m = { 'content': `${random > 0 ? random : [2, 4, 1][Math.floor(Math.random() * 3)]}` }
        } else {
          m = (await batsman.dmChannel.awaitMessages(
            m => m.author.id === batsman.id,
            { max: 1, time: 60000, errors: ["time"] }
          )).first()
        }
        
        if (isInnings2 == 'over') return;
        if (isInnings2 && !target) return;
        
        let c = m.content.toLowerCase().trim();
        let newScore = parseInt(await batArray[batArray.length - 1]) + parseInt(c);
        let bowled = await ballArray[ballArray.length - 1];

        //End the match
        if (c == 'end' || c =='e.hc end' || c == 'e.hc x') {
          isInnings2 = 'over';
          let text = `**${batsman.username}** forfeited`
          batsman.send(text);
          bowler.send(text);
          if (post == true) channel.send(text);
          await changeStatus(batsman, bowler);
          return;
        } //Communication
        else if (isNaN(c)) {
          bowler.send(`\`${batsman.username}\`:  ${c}`);
          return loopBatCollect();
        } //Wait for the ball
        else if (ballArray.length === batArray.length) {
          batsman.send("Wait for the ball dude");
          return loopBatCollect();
        } //Number validation
        else if (parseInt(c) > max || parseInt(c) < 0) {
          batsman.send("Max number that can be hit is 6");
          return loopBatCollect();
        } //Dot
        else if (parseInt(c) === 0) {
          const bal = await updateBag('dots', 1, await db.findOne({_id: batsman.id}), { channel: batsman });
          if (bal == 'err') {
            return loopBatCollect();
          } else if (noOfUsedDots === 3) {
            batsman.send('Only 3 dots can be used in a match and you are left with 0!');
            return loopBatCollect();
          } else {
            noOfUsedDots += 1;
          }
        } //Wicket
        if (bowled === parseInt(c)) {
          wickets -= 1;
          batArray.push(batArray.slice(-1)[0]);
          
          const comment = await commentry(bowled, 'W');
          const embed = new Discord.MessageEmbed()
            .setTitle("Cricket Match")
            .setDescription(comment)
            .addField(batsman.username + " - Batting", `**Score:**      ${batArray[batArray.length - 1]} (${ballArray.length - 1})\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
            .addField(bowler.username + " - Bowling", `${target || 0} (${targetIn || 0})`, true)
            .setColor(embedColor);
          if (challenge) embed.setFooter(challenge.info)

          if (wickets === 0) {
            if (!target) {
              isInnings2 = true;
              await batsman.send("☝️ Wicket! Second Innings starts. The bowler bowled " + ballArray[ballArray.length - 1], embed);
              await bowler.send(`☝️ Wicket! Second Innings statts. The batsman hit ${c}${dot(c, bowled)}`, embed);
              if (post === true) await channel.send(`☝️ Wicket! Second Innings starts. He hit ${c}${dot(c, bowled)}, and was bowled ${ballArray[ballArray.length - 1]}`, embed);
              if (!challenge || challenge?.doubleInnings) return start(bowler, batsman, {
                'batArray': batArray,
                'ballArray': ballArray,
              });
            } else {
              isInnings2 = 'over';
              const coins = Math.floor(Math.random() * 345 * ((await db.findOne({ _id: bowler.id }) || {}).coinMulti || 0.2));
              await batsman.send("☝️ You lost! The bowler bowled " + ballArray[ballArray.length - 1], embed);
              await bowler.send(`☝️ You won! The batsman hit ${c}${dot(c, bowled)} and looted ${await getEmoji('coin')} ${coins}`, embed);
              if (post === true) await channel.send(`**${bowler.username}** won!!! ☝️ Wicket! Batsman hit ${c}${dot(c, bowled)}, and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.username}**`, embed);
              await changeStatus(batsman, bowler)
              return rewards(bowler, batsman, coins, oldLogs, {
                'batArray': batArray,
                'ballArray': ballArray,
              }, message, challenge);
            }
          } else {
            await batsman.send("☝️ Wicket! The bowler bowled " + ballArray[ballArray.length - 1], embed);
            await bowler.send(`☝️ Wicket! The batsman hit ${c}${dot(c, bowled)}`, embed);
            if (post === true) await channel.send(`☝️ Wicket! Batsman hit ${c}${dot(c, bowled)}, and was bowled ${ballArray[ballArray.length - 1]}`, embed);
            return loopBatCollect();
          }
        } //Target++
        else if (target && newScore >= target) {
          batArray.push(newScore);
          isInnings2 = 'over';
          const coins = Math.floor(Math.random() * 345 * ((await db.findOne({ _id: batsman.id }) || {}).coinMulti || 0.2));
          await batsman.send("🔥 You won! You chased the target!" +  ` You looted ${await getEmoji('coin')} ${coins}`);
          await bowler.send('You lost! The batsman chased the target');
          if (post === true) await channel.send(`**${batsman.username}** won!!! He chased the target!`);
          changeStatus(batsman, bowler)
          return rewards(batsman, bowler, coins, {
            'batArray': batArray,
            'ballArray': ballArray,
          }, oldLogs, message, challenge);
        } //Push
        else {
          batArray.push(newScore);
         
          const comment = await commentry(bowled, parseInt(c));
          const embed = new Discord.MessageEmbed()
            .setTitle("Cricket Match")
            .setDescription(comment)
            .addField(batsman.username + " - Batting", `**Score:**      ${newScore} (${ballArray.length - 1})\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
            .addField(bowler.username + " - Bowling", `${target || 0} (${targetIn || 0})`, true)
            .setColor(embedColor);
          if (challenge) embed.setFooter(challenge.info)

          await batsman.send(`You hit ${c}${dot(c, bowled)} and you were bowled ${bowled}, **Scoreboard**`, { embed });
          await bowler.send(`Batsman hit ${c}${dot(c, bowled)}, **Scoreboard**`, { embed });
          if (post === true) await channel.send(`**${batsman.username}** hit ${c}${dot(c, bowled)}, and was bowled ${bowled} by **${bowler.username}**`, { embed });
          return loopBatCollect();
        }
      } catch (e) {
        console.log(e)
        
        if (isInnings2 == 'over') return;
        if (isInnings2 && !target) return;
        
        isInnings2 = 'over';
        batsman.send("Match ended as you were inactive.");
        bowler.send("Match ended as the batsman was inactive.");
        if (post === true) channel.send(`Match ended due to inactivity.. Sadge`);
        return changeStatus(batsman, bowler);
      }
    }
  }
};

async function changeStatus(a, b) {
  await db.findOneAndUpdate({ _id: a.id }, { $set: { status: false } });
  await db.findOneAndUpdate({ _id: b.id }, { $set: { status: false } });
}

function dot(c, bowled) {
  if(c === 0) {
    return ' (used a dot)';
  } else {
    return '';
  }
}

let swapCounter = 0
async function cpuBowl(batsman, batArray) {
  let pattern = batsman.pattern || {5: 0, 6: 0, 3: 0, 4: 0, 1: 0, 2: 0}
  let arr = batArray
  arr = arr.slice(-4).map((v, i, a) => v - (a[i - 1] || 0))
  arr = arr.slice(-3)
  
  let random = Math.random()
    
  if (arr.length > 2) {
    // If spamming 2 nums
    if (arr[0] === arr[2]) {
      swapCounter += 1
      if (swapCounter > 1) {
        return arr[1]
      } else {
        return random < 0.4 ? arr[1] :
               random < 0.75 ? 6 :
               pattern[1]
      }
    } // If spamming same number
    else if (arr[1] === arr[2]) {
      let num = arr.slice(-1)[0]
      
      if (batArray.filter(x => x === num).length > 5) {
        return random < 0.5 ? num :
               pattern[0]
      } else if (batArray.filter(x => x === num - 2).length > 5) {
        return random < 0.5 ? 5 :
               6
      } else {
        return random < 0.45 ? num :
               num > 1 ? num - 1 :
               random < 0.100 ? arr.slice(-1) :
               random < 0.400 ? pattern[0] :
               random < 0.600 ? pattern[1] :
               random < 0.750 ? pattern[2] :
               random < 0.870 ? pattern[3] :
               random < 0.950 ? pattern[4] :
               pattern[5]
      }
    } 
  } 
  
  return (random < 0.100 ? arr.slice(-1) :
         random < 0.400 ? pattern[0] :
         random < 0.600 ? pattern[1] :
         random < 0.750 ? pattern[2] :
         random < 0.870 ? pattern[3] :
         random < 0.950 ? pattern[4] :
         pattern[5]) || [3, 6, 4, 5, 6, 1][Math.floor(Math.random() * [3, 6, 4, 5, 6, 1].length)]
}