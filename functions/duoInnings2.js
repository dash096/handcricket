const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getEmoji = require('../index.js');
const rewards = require('./rewards.js');
const updateBag = require('./updateBag.js');
const serverID = require('./getServerID.js');
const embedColor = require('./getEmbedColor.js');

//shuffled
module.exports = async function(bowler, batsman, boS, baB, message, post) {
  const emoji = await getEmoji('coin');
  
  const { channel } = message;
  
  const target = boS;
  
  let noOfUsedDots = 0;
  let useDot = false;
  let useMagik = [false, 1];

  const embed = new Discord.MessageEmbed()
    .setTitle('Cricket Match - Second Innings')
    .addField(batsman.username + ' - Batsman', 0, true)
    .addField(bowler.username + ' - Bowler', target, true)
    .setColor(embedColor);

  //Embeds
  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);
  if(post === true) await channel.send("2nd Inning starts!",{embed});

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
      let c = m.content;
      //change c if magikball
      if(c.trim().toLowerCase() == 'magikball' || c.trim().toLowerCase() == 'magik' || c.trim().toLowerCase() == 'mb') {
        c = 'magikball';
      }
      
      //End the match
      if (c.toLowerCase().trim() === 'end') {
        timeoutDecider = false;
        bowler.send('You forfeited');
        batsman.send(`**${bowler.username}** forfeited`);
        if(post === true) channel.send('Match ended sadge, ' + `${bowler.tag} forfeited`);
        return changeStatus(batsman,bowler);
      } //Communicatiom
      else if (isNaN(c) && c != 'magikball') {
        batsman.send(`\`${bowler.username}\`: ${c}`);
        return loopBallCollect();
      } //Turn based
      else if (batArray.length < ballArray.length) {
        m.reply('Wait for the batsman to hit your previous ball!');
        return loopBallCollect();
      } //Number Validation
      else if (parseInt(c) > 6) {
        m.react('❌');
        return loopBallCollect();
      } //Magik Ball
      else if (c == 'magikball') {
        let updateBagObj = {}; updateBagObj.channel = bowler;
        let bal = updateBag('magikball', 1, await db.findOne({_id: bowler.id}), updateBagObj);
        if(bal == 'err') return loopBallCollect();
        if(batArray[batArray.length - 1] < 49) {
          bowler.send('Magik ball can only be used if the batsman score is above 49');
          return loopBallCollect();
        } else if(useMagik[0] === true) {
          bowler.send('Magik ball can only be used once. sad.');
          return loopBallCollect();
        } 
        let availableRando = [1, 2, 3, 4, 5];
        let magikRando = availableRando[Math.floor(Math.random() * availableRando.length)];
        bowler.send(`MagikBall on, now choose any one of these - ${magikRando} or ${magikRando + 1}`);
        let bowledMagik = await letBowlerChooseMagik(magikRando, bowler, batsman);
        useMagik = [true, magikRando];
        ballArray.push(parseInt(bowledMagik));
        return loopBallCollect();
      } //Push
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
        if(post === true) channel.send('Match ended sadge');
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
      let c = m.content;
      let bowled = await ballArray[ballArray.length - 1];
      let newScore = await batArray[batArray.length - 1] + parseInt(c);
      const totalBalls = await ballArray.length;
      const boB = totalBalls;
      const baS = newScore;
      
      //End
      if (c.toLowerCase().trim() === "end") {
        timeoutDecider = false;
        batsman.send('You forfeited');
        bowler.send(`**${batsman.username}** forfeited`);
        if(post === true) channel.send('Match ended sadge, ' + `${batsman.tag} forfeited`);
        return changeStatus(batsman,bowler);
      } //Communication
      else if (isNaN(c)) {
        bowler.send(`\`${batsman.username}\`: ${c}`);
        return loopBatCollect();
      } //Number Validation
      else if (parseInt(c) > 6) {
        m.react('❌');
        return loopBatCollect();
      } //Turn Based
      else if (batArray.length === ballArray.length) {
        m.reply('Wait for the ball dude.');
        return loopBatCollect();
      } //Magik Ball
      else if (useMagik[0] === true) {
        let rando = useMagik[1];
        if (parseInt(c) != parseInt(rando) && parseInt(c) != parseInt(rando + 1)) {
          batsman.send(`You are compelled to use only ${rando} or ${rando + 1} by the magikball`);
          return loopBatCollect();
        }
        useMagik = [false, 1];
      } //Dot
      else if (parseInt(c) === 0) {
        const updateBagObj = {}; 
        updateBagObj.channel = batsman;
        const bal = await updateBag('dots', 1, await db.findOne({_id: batsman.id}), updateBagObj);
        if(bal == 'err') return loopBatCollect();
        else if(noOfUsedDots === 3) {
          batsman.send(`You can only use Dot 3 times per match and you have 0 left!`);
          return loopBatCollect();
        } else if(parseInt(c) == ballArray[ballArray.length - 1]) {
          await batsman.send(`Hehe! Bowler guessed you, Wicket! You lost sadge..`);
          await bowler.send(`Wicket! You guessed the batsman. You won a grand amount of ${emoji} ${coins}!`);
          if(post === true) channel.send(`Wicket! The bowler won!`);
          return rewards(bowler, batsman, coins, boS, boB, baS, baB, message);
        } else {
          useDot = true;
          noOfUsedDots += 1;
          c = ballArray[ballArray.length - 1];
          newScore = (batArray[batArray.length - 1]) + parseInt(ballArray[ballArray.length - 1]);
        }
      } //Wicket
      if (parseInt(c) === parseInt(ballArray[ballArray.length - 1]) && useDot == false) {
        changeStatus(batsman,bowler);
        const data = await db.findOne({
          _id: bowler.id
        });
        
        const coins = getCoins(data, message);

        if((target - (newScore - parseInt(c))) === 1) {
          bowler.send(`Wicket! The batsman hit ${c}${dot(c, ballArray[ballArray.length - 1], useDot)}! It is a tie!`);
          batsman.send('Wicket! The bowler bowled' + ballArray[ballArray.length - 1] + '! It is a tie!');
          if(post === true) channel.send(`**${batsman.tag}** WICKET!! DUCK! He hit ${c}${dot(c, ballArray[ballArray.length - 1], useDot)} and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.tag}**`);
        } else {
          bowler.send(`Wicket! The batsman hit ${c}${dot(c, ballArray[ballArray.length - 1], useDot)}! You won a grand amount of ${emoji} ${coins}!`);
          batsman.send('Wicket! The bowler bowled ' + ballArray[ballArray.length - 1] + '! You lost... Sadge');
          if(post === true) channel.send(`**${batsman.tag}** WICKET! He hit ${c}${dot(c, ballArray[ballArray.length - 1], useDot)} and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.tag}**`);
          rewards(bowler, batsman, coins, boS, boB, baS, baB, message);
        }

        changeStatus(batsman, bowler);
        timeoutDecider = false;
        return;
      } //Target
      else if (parseInt(newScore) >= target) {
        useDot = false;
        timeoutDecider = false;
        changeStatus(batsman,bowler);
        const data = await db.findOne({
          _id: batsman.id
        });
        
        const coins = getCoins(data, message);
        
        batsman.send(`Score is ${newScore}! The bowler bowled ${ballArray[ballArray.length - 1]}! You won a grand amount of ${emoji} ${coins}!`);
        bowler.send(`Batsman score is ${newScore}! The batsman hit ${c}${dot(c, bowled, useDot)}! You lost... sadge`);
        if(post === true) channel.send(`**${batsman.tag}** crossed the target!! HE **WON**!! He hit ${c}${dot(c, bowled, useDot)} and was bowled ${ballArray[ballArray.length - 1]} by **${bowler.tag}**`);
        rewards(batsman, bowler, coins, baS, baB, boS, boB, message);
        
        changeStatus(batsman,bowler);
        timeoutDecider = false;
        return;
      }
      //Push
      else {
        useDot = false;
        batArray.push(parseInt(newScore));

        const embed = new Discord.MessageEmbed()
        .setTitle('Cricket Match - Second Innings')
        .addField(batsman.username + ' - Batsman', parseInt(newScore), true)
        .addField(bowler.username + ' - Bowler', target, true)
        .setColor(embedColor);

        batsman.send(`You hit ${c} and you were bowled ${ballArray[ballArray.length - 1]}`, {embed});
        bowler.send(`${batsman.username} hit ${c}${dot(c, bowled, useDot)}`, {embed});
        if(post === true) channel.send(`${batsman.tag} hit ${c}${dot(c, bowled, useDot)}, and was bowled ${ballArray[ballArray.length - 1]} by ${bowler.tag}`, {embed})
        return loopBatCollect();
      }
    } catch(e) {
      console.log(e);
      if(timeoutDecider === true) {
        timeoutDecider = false;
        batsman.send('Match ended as you were inactive');
        bowler.send('Match ended as the batsmam was inactive');
        if(post === true) channel.send('Match ended sadge');
      }
      return changeStatus(batsman,bowler);
    }
  }
  
};

async function changeStatus(a,b) {
  await db.findOneAndUpdate({_id: a.id}, { $set: { status: false } } );
  await db.findOneAndUpdate({_id: b.id}, { $set: { status: false } } );
}

function getCoins(data, message) {
  let coinMulti = data.coinMulti;
  if (coinMulti === 0) coinMulti = 0.2;
  if(message.guild.id == serverID) {
    coinMulti = coinMulti * 2;
  }
  const rando = Math.random() * coinMulti * 696;
  const coins = rando.toFixed(0);
  return coins;
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
  }
}