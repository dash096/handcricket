const db = require("../schemas/player.js");
const Discord = require("discord.js");

//shuffled
module.exports = async function(bowler, batsman, target) {
  bowler.send("2nd Innings starts");
  batsman.send("2nd Innings starts");
  
  const embed = new Discord.MessageEmbed()
    .setTitle('Cricket Match - Second Innings')
    .addField(batsman.username + ' - Batsman', 0)
    .addField(bowler.username + ' - Bowler', target)
    .setColor('RANDOM')
    
  //Embeds
  const batEmbed = await batsman.send(embed);
  const ballEmbed = await bowler.send(embed);
  
  //Arrays
  const batArray = [];
  const ballArray = [];
  
  //Collectors
  const batCollector = batsman.dmChannel.createMessageCollector(
    m => m.author.id === batsman.id
    );
  const ballCollector = bowler.dmChannel.createMessageCollector(
    m => m.author.id === bowler.id
    );
    
    
  //Bowler Collection
  ballCollector.on('collect', async m => {
    const c = m.content;
    
    //End
    if(c.toLowerCase().trim() === 'end') {
      end(batCollector, ballCollector);
      bowler.send('You forfeited');
      batsman.send(`**${bowler.username}** forfeited`)
      return;
    }
    
    //Communicatiom
    else if(isNaN(c)) {
      batsman.send(`\`${bowler.username}\`: ${c}`)
      return;
    }
    
    //Number Validation
    else if(parseInt(c) > 9) {
      m.react('❌');
      return;
    }
    
    //Turn based
    else if(batArray.length < ballArray.length) {
      m.reply('Wait for the batsman to hit your previous ball!');
      return;
    }
    
    //Push
    else {
      ballArray.push(parseInt(c))
      await bowler.send('You bowled ' + c );
      await batsman.send('Ball is coming...');
    }
  });
  
  
  //Batsman Collection
  batCollector.on('collect', async m => {
    const c = m.content;
    const bowled = await parseInt(ballArray[ballArray.length - 1]);
    const oldScore = await parseInt(batArray[batArray.length - 1]);
    
    //End
    if(c.toLowerCase().trim() === "end") {
      end(batCollector, ballCollector);
      batsman.send('You forfeited');
      bowler.send(`**${batsman.username}** forfeited`);
      return;
    }
    
    //Communication
    else if(isNaN(c)) {
      bowler.send(`\`${batsman.username}\`: ${c}`);
      return;
    }
    
    //Number Validation
    else if(parseInt(c) > 9) {
      m.react('❌');
      return;
    }
    
    //Turn Based
    else if(batArray.length === ballArray.length) {
      m.reply('Wait for the ball dude.');
      return;
    }
    
    //Wicket
    else if(parseInt(c) === bowled) {
      end(batCollector, ballCollector);
      
      const data = await db.findOne({ _id:batsman.id });
      
      let multi = 6969 * data.goldMulti;
      if(multi === 0) multi = 696;
      
      const coins = Math.floor(Math.random() * multi );
      
      bowler.send(`Wicket! Piro! and also a grand amount of ${coins} coins`);
      batsman.send('Wicket! Noob!');
      return;
    }
    
    //Target
    else if( parseInt(oldScore + parseInt(c)) >= target) {
      end(batCollector, ballCollector);
      
      const data = await db.findOne({ _id:batsman.id });
      
      let multi = 6969 * data.goldMulti;
      if(multi === 0) multi = 69;
      
      const coins = Math.floor(Math.random() * multi );
      
      bowler.send('You lost..');
      batsman.send(`You won! and also a grand amount of ${coins} coins`)
      return;
    }
    
    else {
        
      const newScore =  parseInt( oldScore + parseInt(c) ) 
      batArray.push(newScore)
      
      const embed = new Discord.MessageEmbed()
        .setTitle('Cricket Match - Second Innings')
        .addField(batsman.username + ' - Batsman', newScore )
        .addField(bowler.username + ' - Bowler', target)
        .setColor('RANDOM')
      
      batsman.send(`You hit ${c} and you were bowled ${bowled}`, {embed} );
      bowler.send(`${batsman.username} hit ${c} }`, {embed} );
    }
  });
};

function end(a, b) {
  a.stop()
  b.stop()
}

function rewards(batsman, bowler) {
  
}