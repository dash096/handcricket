const db = require("../schemas/player.js");
const Discord = require("discord.js");
const secondInnings = require("./innings2.js");
const updateBag = require('./updateBag.js');

module.exports = async function(batsman, bowler, message, post) {
  const embed = new Discord.MessageEmbed()
    .setTitle("Cricket Match - First Innings")
    .addField(batsman.username + " - Batsman", 0, true)
    .addField(bowler.username + " - Bowler", 0, true)
    .setColor("#2d61b5");

  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);
  
  let batDots = 0;
  let useDot = false;
  
  const batArray = [0];
  const ballArray = [0];

  let timeoutDecider = true;

  const mc = message.channel;
  if (post === true) {
    await mc.send(embed);
  }

  loopBallCollect();
  loopBatCollect();

  async function loopBallCollect() {
    //Return if timeout.
    if (timeoutDecider === false) return;
    
    try {
      const msgs = await bowler.dmChannel.awaitMessages(
        m => m.author.id === bowler.id,
        { max: 1, time: 30000, errors: ["time"] }
      );
      const m = msgs.first();
      const c = m.content;

      //End the match
      if (c == "end") {
        timeoutDecider = false;
        changeStatus(batsman, bowler);
        batsman.send(`**${bowler.username}** forfeited`);
        bowler.send(`You forfeited`);
        if (post === true) mc.send(`${bowler.tag} forfeited..`);
        return;
      }
      //Communication
      else if (isNaN(c)) {
        batsman.send(`\`${bowler.username}\`: ${c}`);
        return loopBallCollect();
      }
      //Number Validation
      else if (c > 6) {
        m.react("❌");
        bowler.send("Max number that can be bowled is 6");
        return loopBallCollect();
      }
      //Turn based
      else if (batArray.length < ballArray.length) {
        bowler.send("Wait for the batsman to hit the previous ball.");
        return loopBallCollect();
      } else { //Push it
        ballArray.push(parseInt(c));
        await bowler.send("You bowled " + c);
        await batsman.send("Ball is coming, hit it by typing a number.");
        return loopBallCollect();
      }
    } catch (e) {
      if (timeoutDecider === true) { //Send only if the bowler has already been inactive.
        timeoutDecider = false;
        bowler.send("Match ended as you were inactive");
        batsman.send("Match ended as the bowler was inactive");
        if (post === true) mc.send(`Match ended due to inactivity.. Sadge`);
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
      const m = msgs.first();
      let c = m.content;
      let newScore = (await batArray[batArray.length - 1]) + parseInt(c);
      let bowled = await ballArray[ballArray.length - 1];

      //End the match
      if (c.toLowerCase() === "end") {
        timeoutDecider = false;
        changeStatus(batsman, bowler);
        batsman.send(`**${batsman.username}(You)** forfeited`);
        bowler.send(`**${batsman.username}** forfeited`);
        if (post == true) mc.send(`${batsman.tag} forfeited..`);
        return;
      }
      //Communication
      else if (isNaN(c)) {
        bowler.send(`\`${batsman.username}\`:  ${c}`);
        return loopBatCollect();
      }
      //Wait for the ball
      else if (ballArray.length === batArray.length) {
        batsman.send("Wait for the ball dude");
        return loopBatCollect();
      }
      //Number validation
      else if (c > 6) {
        batsman.send("Max number that can be hit is 6");
        return loopBatCollect();
      }
      //Dot
      else if (parseInt(c) === 0) {
        const updateBagObj = {}; 
        updateBagObj.channel = batsman;
        const bal = await updateBag('dots', 1, await db.findOne({_id: batsman.id}), updateBagObj);
        if(bal == 'err') {
          return loopBatCollect();
        } else if(batDots === 3) {
          batsman.send('Only 3 dots can be used in a match and you are left with 0!');
          return loopBatCollect();
        } else if(parseInt(c) === parseInt(bowled)) {
          await batsman.send(`Hehe! The bowler guessed you, Wicket!`);
          await bowler.send(`You guessed, it\'s a Wicket!`);
          if(post === true) await mc.send(`Batsman hit a dot, the bowler guessed so! Wicket!`);
          await secondInnings(batsman, bowler, batArray[batArray.length - 1] + 1, await (ballArray.length - 1), message, post);
          return;
        } else {
          useDot = true;
          batDots += 1;
          c = bowled;
          newScore = (await batArray[batArray.length - 1]) + parseInt(bowled);
        }
      }
      //Wicket
      if (parseInt(bowled) === parseInt(c) && useDot == false) {
        timeoutDecider = false;
        await batsman.send("Wicket! The bowler bowled " + bowled);
        await bowler.send("Wicket! The batsman hit " + c);
        if (post === true) await mc.send(`**${batsman.tag}** wicket!!! He hit ${c}, and was bowled ${bowled} by **${bowler.username}**`);
        await secondInnings( batsman, bowler, batArray[batArray.length - 1] + 1, await (ballArray.length - 1), mc, post );
        return;
      } else { //Push
        useDot = false;
        batArray.push(newScore);
        const embed = new Discord.MessageEmbed()
          .setTitle("Cricket Match - First Innings")
          .addField(batsman.username + " - Batsman", newScore, true)
          .addField(bowler.username + " - Bowler", 0, true)
          .setColor("#2d61b5");

        await batsman.send(`You hit ${c} and you were bowled ${bowled}, **Scoreboard**`, { embed });
        await bowler.send(`Batsman hit ${c}, **Scoreboard**`, { embed });
        if (post === true) await mc.send(`**${batsman.tag}** hit ${c}, and was bowled ${bowled} by **${bowler.username}**`, { embed });
        return loopBatCollect();
      }
    } catch (e) {
      console.log(e)
      if (timeoutDecider === true) {
        timeoutDecider = false;
        batsman.send("Match ended as you were inactive.");
        bowler.send("Match ended as the batsman was inactive.");
        if (post === true) mc.send(`Match ended due to inactivity.. Sadge`);
      }
      return changeStatus(batsman, bowler);
    }
  }
};

async function changeStatus(a, b) {
  await db.findOneAndUpdate({ _id: a.id }, { $set: { status: false } });
  await db.findOneAndUpdate({ _id: b.id }, { $set: { status: false } });
}