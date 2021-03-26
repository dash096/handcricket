const db = require("../schemas/player.js");
const Discord = require("discord.js");

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

  loopBallCollector();
  loopBatCollector();

  //BowlerCollector
  function loopBallCollector() {
    bowler.dmChannel
      .awaitMessages(response => response.author.id === bowler.id, {
        max: 1,
        time: 30000,
        errors: ["time"]
      })
      .then(async collected => {
        const c = collected.first().content;

        //End
        if (c === "end") {
          changeStatus(batsman, bowler);
          batsman.send(`**${bowler.username}** forfeited`);
          bowler.send(`You forfeited`);
          return;
        }

        //Communication
        else if (isNaN(c)) {
          batsman.send(`\`${bowler.username}\`: ${c}`);
          return loopBallCollector();
        }

        //Number Validation
        else if (c > 9) {
          collected.first().react("❌");
          return loopBallCollector();
        }

        //Turn based
        else if (batArray.length < ballArray.length) {
          bowler.send("Wait for the batsman to hit the previous ball.");
          return loopBallCollector();
        } else {
          //Push it in array
          ballArray.push(parseInt(c));
          //Send confirm messages
          await bowler.send("You bowled " + c);
          await batsman.send("Ball is coming, hit it by typing a number.");
          return loopBallCollector();
        }
      })
      .catch(e => {
        changeStatus(batsman, bowler);
        bowler.send("Match ended as time up.");
        batsman.send("The batsman was inactive for a long time. Match ended.");
      });
  }

  function loopBatCollector() {
    batsman.dmChannel
      .awaitMessages(response => response.author.id === batsman.id, {
        max: 1,
        time: 30000,
        errors: ["time"]
      })
      .then(async collected => {
        {
          const c = collected.first().content;
          //End
          if (c.toLowerCase() === "end") {
            changeStatus(batsman, bowler);
            batsman.send(`**${batsman.username}** forfeited`);
            bowler.send(`**${batsman.username}** forfeited`);
            return;
          }

          //Communication
          else if (isNaN(c)) {
            bowler.send(`\`${batsman.username}\`:  ${c}`);
            return loopBatCollector();
          }

          //Wait for the ball
          else if (ballArray.length === batArray.length) {
            batsman.send("Wait for the ball dude");
            return loopBatCollector();
          }

          //Number validation
          else if (c > 9) {
            collected.first().react("❌");
            return loopBatCollector();
          }

          const bowled = await ballArray[ballArray.length - 1];

          //Wicket
          if (parseInt(bowled) === parseInt(c)) {
            start2(batsman, bowler, batArray[batArray.length - 1] + 1);
            batsman.send("Wicket! You are out nab");
            bowler.send("Wicket! Pro!");
            return;
          }

          const newScore = (await batArray[batArray.length - 1]) + parseInt(c);

          if (parseInt(c) < 10) {
            //Push in the array
            batArray.push(newScore);
            //Confirm Embeds
            const embed = new Discord.MessageEmbed()
              .setTitle("Cricket Match - First Innings")
              .addField(batsman.username + " - Batsman", newScore, true)
              .addField(bowler.username + " - Bowler", 0, true)
              .setColor("#2d61b5");

            await batsman.send(
              `You hit ${c} and you were bowled ${bowled}, **Scoreboard**`,
              {
                embed
              }
            );
            await bowler.send(`Batsman hit ${c}, **Scoreboard**`, {
              embed
            });
            loopBatCollector();
          }
        }
      })
      .catch(e => {
        changeStatus(batsman, bowler);
        batsman.send("Match end as Time over,");
        bowler.send("The batsman was inactive for a long time. Match ended.");
      });
  }
};

function start2(batsman, bowler, target) {
  const secondInnings = require("./innings2.js");
  secondInnings(batsman, bowler, target);
}

async function changeStatus(a, b) {
  await db.findOneAndUpdate(
    {
      _id: a.id
    },
    {
      $set: {
        status: false
      }
    }
  );
  await db.findOneAndUpdate(
    {
      _id: b.id
    },
    {
      $set: {
        status: false
      }
    }
  );
}
