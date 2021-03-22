const db = require("../schemas/player.js");
const Discord = require("discord.js");

module.exports = async function(batsman, bowler) {
  const embed = new Discord.MessageEmbed()
  .setTitle("Cricket Match - First Innings")
  .addField(batsman.username + " - Batsman", 0)
  .addField(bowler.username + " - Bowler", 0)
  .setColor("RANDOM");

  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);

  const batArray = [0];
  const ballArray = [0];

  const batsmanCollector = batsman.dmChannel.createMessageCollector(
    m => m.author.id === batsman.id
  );
  const bowlerCollector = bowler.dmChannel.createMessageCollector(
    m => m.author.id === bowler.id
  );

  //Bowler Collection
  bowlerCollector.on("collect", async m => {
    const c = m.content;

    //End
    if (c === "end") {
      end(batsmanCollector, bowlerCollector);
      batsman.send(`**${bowler.username}** forfeited`);
      bowler.send(`You forfeited`);
      return;
    }

    //Communication
    else if (isNaN(c)) {
      batsman.send(`\`${bowler.username}\`: ${c}`);
      return;
    }

    //Number Validation
    else if (c > 9) {
      m.react("❌");
      return;
    }

    //Turn based
    else if (batArray.length < ballArray.length) {
      bowler.send("Wait for the batsman to hit the previous ball.");
      return;
    } else {
      //Push it in array
      ballArray.push(parseInt(c));
      //Send confirm messages
      await bowler.send("You bowled " + c);
      await batsman.send("Ball is coming, hit it by typing a number.");
    }
  });

  //Batsman Collection
  batsmanCollector.on("collect",
    async m => {
      const c = m.content;
      //End
      if (c.toLowerCase() === "end") {
        end(batsmanCollector, bowlerCollector);
        batsman.send(`**${batsman.username}** forfeited`);
        bowler.send(`**${batsman.username}** forfeited`);
        return;
      }

      //Communication
      else if (isNaN(c)) {
        bowler.send(`\`${batsman.username}\`:  ${c}`);
        return;
      }

      //Wait for the ball
      else if (ballArray.length === batArray.length) {
        batsman.send("Wait for the ball dude");
        return;
      }

      //Number validation
      else if (c > 9) {
        m.react("❌");
        return;
      }

      const bowled = await ballArray[ballArray.length - 1];

      //Wicket
      if (parseInt(bowled) === parseInt(c)) {
        end(batsmanCollector, bowlerCollector);
        start2(batsman, bowler, batArray[batArray.length - 1] + 1);
        batsman.send("Wicket! You are out nab");
        bowler.send("Wicket! Pro!");
        return;
      }

      const newScore = await batArray[batArray.length - 1] + parseInt(c);

      if (parseInt(c) < 9) {
        //Push in the array
        batArray.push(newScore);
        //Confirm Embeds
        const embed = new Discord.MessageEmbed()
        .setTitle("Cricket Match - First Innings")
        .addField(batsman.username + " - Batsman", newScore)
        .addField(bowler.username + " - Bowler", 0)
        .setColor("RANDOM");

        await batsman.send(`You hit ${c} and you were bowled ${bowled}, **Scoreboard**`, {
          embed
        });
        await bowler.send(`Batsman hit ${c}, **Scoreboard**`, {
          embed
        });
      }
    });
};

function end(a, b) {
  a.stop();
  b.stop();
}

function start2(batsman, bowler, target) {
  const secondInnings = require("./innings2.js");
  secondInnings(batsman,
    bowler,
    target);
}