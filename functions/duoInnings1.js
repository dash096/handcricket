const db = require("../schemas/player.js");
const Discord = require("discord.js");
const secondInnings = require("./duoInnings2.js");
const updateBag = require('./updateBag.js');
const getEmoji = require('../index.js');
const embedColor = require('./getEmbedColor.js');

module.exports = async function(batsman, bowler, message, post) {
  const { channel, author, mentions, content } = message;
  
  const embed = new Discord.MessageEmbed()
    .setTitle("Cricket Match - First Innings")
    .addField(batsman.username + " - Batsman", 0, true)
    .addField(bowler.username + " - Bowler", 0, true)
    .setColor(embedColor);
  await batsman.send(embed);
  await bowler.send(embed);
  
  let noOfUsedDots = 0;
  let useDot = false;
  let useMagik = [false, 1];
  
  const batArray = [0];
  const ballArray = [0];

  let timeoutDecider = true;

  if (post === true) {
    await channel.send(embed);
  }

  loopBallCollect();
  loopBatCollect();

  async function loopBallCollect() {
    if (timeoutDecider === false) return;
    
    try {
      const msgs = await bowler.dmChannel.awaitMessages(
        m => m.author.id === bowler.id,
        { max: 1, time: 30000, errors: ["time"] }
      );
      if(timeoutDecider === false) return;
      const m = msgs.first();
      let c = m.content;
      //change c if magikball
      if(c.trim().toLowerCase() == 'magikball' || c.trim().toLowerCase() == 'magik' || c.trim().toLowerCase() == 'mb') {
        c = 'magikball';
      }
      
      //End the match
      if (c == "end") {
        timeoutDecider = false;
        changeStatus(batsman, bowler);
        batsman.send(`**${bowler.username}** forfeited`);
        bowler.send(`You forfeited`);
        if (post === true) channel.send(`${bowler.tag} forfeited..`);
        return;
      } //Communication
      else if (isNaN(c) && c != 'magikball') {
        batsman.send(`\`${bowler.username}\`: ${c}`);
        return loopBallCollect();
      } //Number Validation
      else if (parseInt(c) > 6) {
        m.react("❌");
        bowler.send("Max number that can be bowled is 6");
        return loopBallCollect();
      } //Turn based
      else if (batArray.length < ballArray.length) {
        bowler.send("Wait for the batsman to hit the previous ball.");
        return loopBallCollect();
      } //Magik Ball
      else if (c === 'magikball') {
        if(useMagik[0] === true) {
          bowler.send('Magik ball can only be used once. sad.');
          return loopBallCollect();
        } else if(batArray[batArray.length - 1] < 49) {
          bowler.send('Magik ball can only be used if the batsman score is above 49');
          return loopBallCollect();
        }
        const bal = await updateBag('magikball', 1, await db.findOne({_id: bowler.id}), { channel: bowler });
        if(bal == 'err') {
          return loopBallCollect();
        }
        let magikRando = availableRando[Math.floor(Math.random() * ([1, 2, 3, 4, 5]).length)];
        let bowledMagik = await letBowlerChooseMagik(magikRando, bowler, batsman);
        if(bowledMagik == 'err') throw 'Timeup';
        useMagik = [true, magikRando];
        ballArray.push(parseInt(bowledMagik));
        return loopBallCollect();
      } //Push it
      else {
        ballArray.push(parseInt(c));
        await bowler.send("You bowled " + c);
        await batsman.send("Ball is coming, hit it by typing a number.");
        return loopBallCollect();
      }
    } catch (e) {
      console.log(e);
      if (timeoutDecider === true) { //Send only if the bowler has already been inactive.
        timeoutDecider = false;
        bowler.send("Match ended as you were inactive");
        batsman.send("Match ended as the bowler was inactive");
        if (post === true) channel.send(`Match ended due to inactivity.. Sadge`);
      }
      return changeStatus(batsman, bowler);
    }
  }

  async function loopBatCollect() {
    if(timeoutDecider === false) return;
    try {
      const msgs = await batsman.dmChannel.awaitMessages(
        m => m.author.id === batsman.id,
        { max: 1, time: 30000, errors: ["time"] }
      );
      if(timeoutDecider === false) return;
      const m = msgs.first();
      let c = m.content;
      let newScore = parseInt(await batArray[batArray.length - 1]) + parseInt(c);
      let bowled = await ballArray[ballArray.length - 1];

      //End the match
      if (c.toLowerCase() === "end") {
        timeoutDecider = false;
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
      else if (c > 6) {
        batsman.send("Max number that can be hit is 6");
        return loopBatCollect();
      } //Magik Ball
      else if (useMagik[0] === true) {
        let rando = useMagik[1];
        if (parseInt(c) != parseInt(rando) && parseInt(c) != parseInt(rando + 1)) {
          batsman.send(`You are compelled to use only ${rando} or ${rando + 1} by the magikball.`);
          return loopBatCollect();
        }
        useMagik = [false, 1];
      } //Dot
      else if (parseInt(c) === 0) {
        const updateBagObj = {}; 
        updateBagObj.channel = batsman;
        const bal = await updateBag('dots', 1, await db.findOne({_id: batsman.id}), updateBagObj);
        if(bal == 'err') {
          return loopBatCollect();
        } else if(noOfUsedDots === 3) {
          batsman.send('Only 3 dots can be used in a match and you are left with 0!');
          return loopBatCollect();
        } else if(parseInt(c) === parseInt(ballArray[ballArray.length - 1])) {
          await batsman.send(`Hehe! The bowler guessed you, Wicket!`);
          await bowler.send(`You guessed, it\'s a Wicket!`);
          if(post === true) await channel.send(`Batsman hit a dot, the bowler guessed so! Wicket!`);
          await secondInnings(batsman, bowler, batArray[batArray.length - 1] + 1, await (ballArray.length - 1), message, post);
          return;
        } else {
          useDot = true;
          noOfUsedDots += 1;
          c = ballArray[ballArray.length - 1];
          newScore = (await batArray[batArray.length - 1]) + parseInt(ballArray[ballArray.length - 1]);
        }
      } //Wicket
      if (parseInt(ballArray[ballArray.length - 1]) === parseInt(c) && dot(c, ballArray[ballArray.length - 1], useDot) == false) {
        timeoutDecider = false;
        await batsman.send("Wicket! The bowler bowled " + ballArray[ballArray.length - 1]);
        await bowler.send(`Wicket! The batsman hit ${c}${dot(c, bowled, useDot)}`);
        if (post === true) await channel.send(`**${batsman.tag}** wicket!!! He hit ${c}${dot(c, bowled, useDot)}, and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.username}**`);
        await secondInnings( batsman, bowler, batArray[batArray.length - 1] + 1, await ballArray.length, message, post, fieldImagePath);
        return;
      } //Push
      else {
        useDot = false;
        batArray.push(newScore);
        
        const embed = new Discord.MessageEmbed()
          .setTitle("Cricket Match - First Innings")
          .addField(batsman.username + " - Batsman", newScore, true)
          .addField(bowler.username + " - Bowler", 0, true)
          .setColor(embedColor);

        await batsman.send(`You hit ${c} and you were bowled ${bowled}, **Scoreboard**`, { embed });
        await bowler.send(`Batsman hit ${c}${dot(c, bowled, useDot)}, **Scoreboard**`, { embed });
        if (post === true) await channel.send(`**${batsman.tag}** hit ${c}${dot(c, bowled, useDot)}, and was bowled ${bowled} by **${bowler.username}**`, { embed });
        return loopBatCollect();
      }
    } catch (e) {
      console.log(e)
      if (timeoutDecider === true) {
        timeoutDecider = false;
        batsman.send("Match ended as you were inactive.");
        bowler.send("Match ended as the batsman was inactive.");
        if (post === true) channel.send(`Match ended due to inactivity.. Sadge`);
      }
      return changeStatus(batsman, bowler);
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

async function letBowlerChooseMagik(rando, bowler, batsman) {
  try {
    bowler.send(`MagikBall on, now bowl any one of these: ${magikRando} or ${magikRando + 1}`);
    const msgs = await bowler.dmChannel.awaitMessages(m => m.author.id === bowler.id, 
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
  } catch (e) {
    console.log(e);
    return 'err'
  }
}