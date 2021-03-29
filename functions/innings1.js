const db = require("../schemas/player.js");
const Discord = require("discord.js");
const secondInnings = require("./innings2.js");

module.exports = async function(batsman, bowler) {
  const embed = new Discord.MessageEmbed()
  .setTitle("Cricket Match - First Innings")
  .addField(batsman.username + " - Batsman", 0, true)
  .addField(bowler.username + " - Bowler", 0, true)
  .setColor("#2d61b5");

  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);

  const batArray = [0];
  const ballArray = [0];
  
  loopBallCollect();
  loopBatCollect();
  
  let bruh = true;

  async function loopBallCollect() {
    if(bruh === false) {
      return;
    }
    try{
      const msgs = await bowler.dmChannel.awaitMessages(
        m => m.author.id === bowler.id,
        { max: 1, time: 30000, errors: ['time'] }
      );
    
      const m = msgs.first();
      const c = m.content;

      //End
      if (c == "end") {
        batsman.send(`**${bowler.username}** forfeited`);
        bowler.send(`You forfeited`);
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
        bowler.send('Max number that can be bowled is 6');
        return loopBallCollect();
      }
      //Turn based
      else if (batArray.length < ballArray.length) {
        bowler.send("Wait for the batsman to hit the previous ball.");
        return loopBallCollect();
      } else {
        //Push it in array
        ballArray.push(parseInt(c));
        //Send confirm messages
        await bowler.send("You bowled " + c);
        await batsman.send("Ball is coming, hit it by typing a number.");
        return loopBallCollect();
      }
    } catch(e) {
      console.log(e);
      changeStatus(batsman,bowler);
      bowler.send('Match ended as you were inactive');
      batsman.send('Match ended as the bowler was inactive');
      return;
    }
  }
  
  
  async function loopBatCollect() {
    try {
      const msgs = await batsman.dmChannel.awaitMessages( m => m.author.id === batsman.id, 
        { max: 1, time: 30000, errors: ['time'] }
      );
      const m = msgs.first();
      const c = m.content;
      const newScore = await batArray[batArray.length - 1] + parseInt(c);
      const bowled = await ballArray[ballArray.length - 1];
      
      //End
      if (c.toLowerCase() === "end") {
        batsman.send(`**${batsman.username}(You)** forfeited`);
        bowler.send(`**${batsman.username}** forfeited`);
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
        //m.react("❌");
        batsman.send('Max number that can be hit is 6');
        return loopBatCollect();
      }
      //Wicket
      else if (parseInt(bowled) === parseInt(c)) {
        bruh = false;
        await batsman.send("Wicket! The bowler bowled " + bowled );
        await bowler.send("Wicket! The batsman hit " + c);
        await secondInnings(batsman, bowler, target);
        return;
      }
      //Push
      else {
        batArray.push(newScore);
        
        const embed = new Discord.MessageEmbed()
          .setTitle("Cricket Match - First Innings")
          .addField(batsman.username + " - Batsman", newScore, true)
          .addField(bowler.username + " - Bowler", 0, true)
          .setColor("#2d61b5");

        await batsman.send(`You hit ${c} and you were bowled ${bowled}, **Scoreboard**`, {embed});
        await bowler.send(`Batsman hit ${c}, **Scoreboard**`, {embed});
        return loopBatCollect();
      }
    } catch(e) {
        console.log(e);
        changeStatus(batsman,bowler);
        batsman.send('Match ended as you were inactive.');
        bowler.send('Match ended as the batsman was inactive.');
        return;
    }
  }
};

async function changeStatus(a,b) {
  await db.findOneAndUpdate({_id: a.id}, { $set: { status: false } } );
  await db.findOneAndUpdate({_id: b.id}, { $set: { status: false } } );
}