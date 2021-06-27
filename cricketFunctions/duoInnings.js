const db = require("../schemas/player.js");
const Discord = require("discord.js");
const updateBag = require('../functions/updateBag.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');
const commentry = require('./getCommentry.js');
const rewards = require('./rewards.js');

module.exports = async function(batsman, bowler, message, post, max = 6, wckts, ovrs, challenge) {
  print(challenge)
  
  const { channel, author, mentions, content } = message;
  
  const embed = new Discord.MessageEmbed()
    .setTitle("Cricket Match - First Innings")
    .addField(batsman.username + " - Batsman", `**Score:**       0\n\n**Wickets Left:**     ${wckts}\n**Balls Left:**     ${ovrs * 6}`, true)
    .addField(bowler.username + " - Bowler", 0, true)
    .setColor(embedColor);
  
  try {
    await batsman.send(embed);
  } catch (e) {
    console.log(e);
    changeStatus(batsman, bowler);
    message.reply(`Cant send message to ${batsman}`);
    return;
  }
  try {
    await bowler.send(embed);
  } catch (e) {
    console.log(e);
    changeStatus(batsman, bowler);
    message.reply(`Cant send message to ${bowler}`);
    return;
  }
  
  let isInnings2;
  
  if (!challenge) start(batsman, bowler)
  else {
    wckts = challenge.wickets
    ovrs = challenge.overs
    post = challenge.post
    max = challenge.max
    if (challenge.type === 'bat') {
      if (challenge.innings === 1) {
        start(challenge.player, challenge.CPU)
      } else if (challenge.innings === 2)  {
        start(challenge.player, challenge.CPU, challenge.target, 10)
      }
    } else if (challenge.type === 'bowl') {
      if (challenge.innings === 1) {
        start(challenge.CPU, challenge.player)
      } else if (challenge.innings === 2)  {
        start(challenge.CPU, challenge.player, challenge.target, 10)
      }
    }
  }
  
  async function start(batsman, bowler, target, balls) {
    let noOfUsedDots = 0;
    let useDot = false;
    
    let wickets = wckts;
    let remainingBalls = ovrs * 6;
    const batArray = [0];
    const ballArray = [0];

    const embed = new Discord.MessageEmbed()
      .setTitle("Cricket Match - First Innings")
      .addField(batsman.username + " - Batsman", `**Score:**      0\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
      .addField(bowler.username + " - Bowler", target || 0, true)
      .setColor(embedColor);
    batsman.send(embed);
    bowler.send(embed);
    if (post === true) {
      await channel.send(embed);
    }

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
          .addField(batsman.username + " - Batsman", `**Score:**      ${batArray.slice(-1)[0]}\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
          .addField(bowler.username + " - Bowler", target || 0, true)
          .setColor(embedColor);
        
        let interval = setInterval(() => {
          if (batArray.length !== ballArray.length) {
            return;
          }
          
          clearInterval(interval);
          if (isInnnings2) {
            isInnings2 = 'over';
            bowler.send(`${ovrs} overs over. You won!`);
            batsman.send(`${ovrs} overs over. You lost!`);
            if (post === true) channel.send(`${ovrs} overs over. Bowler won!`);
            changeStatus(batsman, bowler);
            if (!challenge) return rewards(bowler, batsman, coins, target - 1, balls, batArray.slice(-1)[0], ballArray.length, message);
          } else {
            isInnings2 = true;
            bowler.send(`${ovrs} overs over. Second Innings starts!`);
            batsman.send(`${ovrs} overs over. Second Innings starts!`);
            if (post === true) channel.send(`${ovrs} overs over. Second Innings starts!`);
            if (!challenge) return start(bowler, batsman, batArray[batArray.length - 1] + 1, ballArray.length);
          }
        }, 1 * 1000);
        return;
      }
      
      try {
        let m
        
        if (bowler.CPU) {
          random = Math.floor(Math.random * 7)
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
          changeStatus(batsman, bowler);
          batsman.send(`**${bowler.username}** forfeited`);
          bowler.send(`You forfeited`);
          if (post === true) channel.send(`${bowler.tag} forfeited..`);
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
        
        if (challenge && challenge.batsman ? challenge.batsman.CPU : false) {
          random = Math.floor(Math.random() * 7)
          m = { 'content': `${random}` }
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
          changeStatus(batsman, bowler);
          batsman.send(`**${batsman.username}(You)** forfeited`);
          bowler.send(`**${batsman.username}** forfeited`);
          if (post == true) channel.send(`${batsman.tag} forfeited..`);
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
            useDot = true;
            noOfUsedDots += 1;
          }
        } //Wicket
        if (bowled === parseInt(c) && dot(c, ballArray[ballArray.length - 1], useDot) == false) {
          wickets -= 1;
          batArray.push(batArray.splice(-1)[0]);
          
          const comment = await commentry(bowled, 'W');
          const embed = new Discord.MessageEmbed()
            .setTitle("Cricket Match")
            .setDescription(comment)
            .addField(batsman.username + " - Batsman", `**Score:**      ${newScore}\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
            .addField(bowler.username + " - Bowler", target || 0, true)
            .setColor(embedColor);

          if (wickets === 0) {
            if (!target) {
              isInnings2 = true;
              await batsman.send("Wicket! Second Innings starts. The bowler bowled " + ballArray[ballArray.length - 1], embed);
              await bowler.send(`Wicket! Second Innings statts. The batsman hit ${c}${dot(c, bowled, useDot)}`, embed);
              if (post === true) await channel.send(`Wicket! Second Innings starts. He hit ${c}${dot(c, bowled, useDot)}, and was bowled ${ballArray[ballArray.length - 1]}`, embed);
              return start(bowler, batsman, batArray[batArray.length - 1] + 1, ballArray.length);
            } else {
              isInnings2 = 'over';
              const coins = Math.floor(Math.random() * 345 * (await db.findOne({ _id: bowler.id })).coinMulti);
              await batsman.send("You lost! The bowler bowled " + ballArray[ballArray.length - 1], embed);
              await bowler.send(`You won! The batsman hit ${c}${dot(c, bowled, useDot)} and looted ${await getEmoji('coin')} ${coins}`, embed);
              if (post === true) await channel.send(`**${bowler.username}** won!!! Wicket! Batsman hit ${c}${dot(c, bowled, useDot)}, and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.username}**`, embed);
              if (!challenge) return rewards(bowler, batsman, coins, target - 1, balls, batArray.slice(-1)[0], ballArray.length, message);
            }
          } else {
            await batsman.send("Wicket! The bowler bowled " + ballArray[ballArray.length - 1], embed);
            await bowler.send(`Wicket! The batsman hit ${c}${dot(c, bowled, useDot)}}`, embed);
            if (post === true) await channel.send(`Wicket! Batsman hit ${c}${dot(c, bowled, useDot)}, and was bowled ${ballArray[ballArray.length - 1]}`, embed);
            return loopBatCollect();
          }
        } //Target++
        else if (target && newScore >= target) {
          isInnings2 = 'over';
          const coins = Math.floor(Math.random() * 345 * (await db.findOne({ _id: batsman.id })).coinMulti);
          await batsman.send("You won! You chased the target!" +  ` You looted ${await getEmoji('coin')} ${coins}`);
          await bowler.send('You lost! The batsman chased the target');
          if (post === true) await channel.send(`**${batsman.username}** won!!! He chased the target!`);
          return rewards(batsman, bowler, coins, batArray.slice(-1)[0], ballArray.length, target - 1, balls, message);
        } //Push
        else {
          useDot = false;
          batArray.push(newScore);
         
          const comment = await commentry(bowled, parseInt(c));
          const embed = new Discord.MessageEmbed()
            .setTitle("Cricket Match")
            .setDescription(comment)
            .addField(batsman.username + " - Batsman", `**Score:**      ${newScore}\n\n**Wickets Left:**     ${wickets}\n**Balls Left:**     ${remainingBalls}`, true)
            .addField(bowler.username + " - Bowler", target || 0, true)
            .setColor(embedColor);

          await batsman.send(`You hit ${c}${dot(c, bowled, useDot)} and you were bowled ${bowled}, **Scoreboard**`, { embed });
          await bowler.send(`Batsman hit ${c}${dot(c, bowled, useDot)}, **Scoreboard**`, { embed });
          if (post === true) await channel.send(`**${batsman.username}** hit ${c}${dot(c, bowled, useDot)}, and was bowled ${bowled} by **${bowler.username}**`, { embed });
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

function dot(c, bowled, useDot) {
  if(bowled == c && useDot !== false) {
    return ' (used a dot)';
  } else {
    return '';
  }
}