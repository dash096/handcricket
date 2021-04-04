const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const rewards = require('./rewards.js');

//shuffled
module.exports = async function(bowler, batsman, baS, boB, mc, post) {
  const emoji = (await getEmoji)[0];
  const target = boS;
  
  const embed = new Discord.MessageEmbed()
    .setTitle('Cricket Match - Second Innings')
    .addField(batsman.username + ' - Batsman', 0, true)
    .addField(bowler.username + ' - Bowler', target, true)
    .setColor('#2d61b5');

  //Embeds
  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);
  if(post === true) await mc.send("2nd Inning starts!",{embed});

  await bowler.send("2nd Innings starts");
  await batsman.send("2nd Innings starts");
  
  //Arrays
  const batArray = [0];
  const ballArray = [0];
  
  let timeoutDecider = true;
  
  loopBallCollect();
  loopBatCollect();
  
  async function loopBallCollect() {
    try {
      if(timeoutDecider === false) {
        return;
      }
      const msgs = await bowler.dmChannel.awaitMessages( m => m.author.id === bowler.id,
        {max: 1, time: 30000, errors: ['time']}
      );
      const m = msgs.first();
      const c = m.content;

      //End the match
      if (c.toLowerCase().trim() === 'end') {
        timeoutDecider = false;
        bowler.send('You forfeited');
        batsman.send(`**${bowler.username}** forfeited`);
        if(post === true) mc.send('Match ended sadge, ' + `${bowler.tag} forfeited`);
        return changeStatus(batsman,bowler);
      }
      //Communicatiom
      else if (isNaN(c)) {
        batsman.send(`\`${bowler.username}\`: ${c}`);
        return loopBallCollect();
      }
      //Number Validation
      else if (parseInt(c) > 6) {
        m.react('❌');
        return loopBallCollect();
      }
      //Turn based
      else if (batArray.length < ballArray.length) {
        m.reply('Wait for the batsman to hit your previous ball!');
        return loopBallCollect();
      }
      //Push
      else {
        ballArray.push(parseInt(c));
        await bowler.send('You bowled ' + c);
        await batsman.send('Ball is coming...');
        return loopBallCollect();
      }
    } catch(e) {
      if(timeoutDecider === true) {
        timeoutDecider = false;
        bowler.send('Match ended as u were unactive for a long time');
        batsman.send('Match ended as the batsman was inactive.');
        if(post === true) mc.send('Match ended sadge');
      }
      return changeStatus(batsman,bowler);
    }
  }
  
  async function loopBatCollect() {
    try {
      if(timeoutDecider === false) return;
      
      const msgs = await batsman.dmChannel.awaitMessages( m => m.author.id === batsman.id,
          {max: 1, time: 30000, errors: ['time']}
      );
      const m = msgs.first();
      const c = m.content;
      const bowled = await ballArray[ballArray.length - 1];
      const newScore = await batArray[batArray.length - 1] + parseInt(c);
      const totalBalls = await ballArray.length;

      //End
      if (c.toLowerCase().trim() === "end") {
        timeoutDecider = false;
        batsman.send('You forfeited');
        bowler.send(`**${batsman.username}** forfeited`);
        if(post === true) mc.send('Match ended sadge, ' + `${batsman.tag} forfeited`);
        return changeStatus(batsman,bowler);
      }
      //Communication
      else if (isNaN(c)) {
        bowler.send(`\`${batsman.username}\`: ${c}`);
        return loopBatCollect();
      }
      //Number Validation
      else if (parseInt(c) > 6) {
        m.react('❌');
        return loopBatCollect();
      }
      //Turn Based
      else if (batArray.length === ballArray.length) {
        m.reply('Wait for the ball dude.');
        return loopBatCollect();
      }
      //Wicket
      else if (parseInt(c) === parseInt(bowled)) {
        changeStatus(batsman,bowler);
        const data = await db.findOne({
          _id: batsman.id
        });

        let coinMulti = data.coinMulti;
        if (coinMulti === 0) coinMulti = 0.2;

        const multi = coinMulti * 696;

        const rando = Math.random() * multi.toFixed(0);
        const coins = rando.toFixed(0);

        if((target - (newScore - parseInt(c))) === 1) {
          bowler.send(`Wicket! DUCK! The batsman hit ${c}! It is a tie!`);
          batsman.send('Wicket! DUCK! The bowler bowled' + bowled + '! It is a tie!');
          if(post === true) mc.send(`**${batsman.tag}** WICKET!! DUCK! He hit ${c} and was bowled ${bowled} by **${bowler.tag}**`);
        } else {
          bowler.send(`Wicket! The batsman hit ${c}! You won a grand amount of ${emoji} ${coins}!`);
          batsman.send('Wicket! The bowler bowled ' + bowled + '! You lost... Sadge');
          if(post === true) mc.send(`**${batsman.tag}** WICKET! He hit ${c} and was bowled ${bowled} by **${bowler.tag}**`, {embed});
          rewards(bowler, batsman, coins, baS, totalBalls, newScore, boB, mc);
        }

        changeStatus(batsman, bowler);
        timeoutDecider = false;
        return;
      }
      //Target
      else if (parseInt(newScore) >= target) {
        timeoutDecider = false;
        changeStatus(batsman,bowler);
        const data = await db.findOne({
          _id: batsman.id
        });

        let coinMulti = data.coinMulti;
        if (coinMulti === 0) coinMulti = 0.2;

        const multi = coinMulti * 696;

        const rando = Math.random() * multi.toFixed(0);
        const coins = rando.toFixed(0);

        batsman.send(`Score is ${newScore}! The bowler bowled ${bowled}! You won a grand amount of ${emoji} ${coins}!`);
        bowler.send(`Batsman score is ${newScore}! The batsman hit ${c}! You lost... sadge`);
        if(post === true) mc.send(`**${batsman.tag}** crossed the target!! HE **WON**!! He hit ${c} and was bowled ${bowled} by **${bowler.tag}**`);
        rewards(batsman, bowler,  coins, newScore, totalBalls, boS, boB, mc);
        
        changeStatus(batsman,bowler);
        timeoutDecider = false;
        return;
      }
      //Push
      else {
        batArray.push(parseInt(newScore));

        const embed = new Discord.MessageEmbed()
        .setTitle('Cricket Match - Second Innings')
        .addField(batsman.username + ' - Batsman', parseInt(newScore), true)
        .addField(bowler.username + ' - Bowler', target, true)
        .setColor('#2d61b5');

        batsman.send(`You hit ${c} and you were bowled ${bowled}`, {embed});
        bowler.send(`${batsman.username} hit ${c}`, {embed});
        if(post === true) mc.send(`${batsman.tag} hit ${c}, and was bowled ${bowled} by ${bowler.tag}`, {embed})
        return loopBatCollect();
      }
    } catch(e) {
      if(timeoutDecider === true) {
        timeoutDecider = false;
        batsman.send('Match ended as you were inactive');
        bowler.send('Match ended as the batsmam was inactive');
        if(post === true) mc.send('Match ended sadge');
      }
      return changeStatus(batsman,bowler);
    }
  }
  
};

async function changeStatus(a,b) {
  await db.findOneAndUpdate({_id: a.id}, { $set: { status: false } } );
  await db.findOneAndUpdate({_id: b.id}, { $set: { status: false } } );
}