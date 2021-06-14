const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');

module.exports = async (client, message, striker, pitcher, post) => {
  const { channel } = message;
  let isInnings2;
  
  let hitPath = './assets/baseball_hit.png';
  let strikePath = './assets/baseball_strike.png';
  let homerunPath = './assets/baseball_homerun.png';
  
  start(striker, pitcher);
  async function start(striker, pitcher, target) {
    if (isInnings2 == 'over' || isInnings2 && !target) return;
    
    let strikes = 0;
    let base = 0;
    let pitchArray = [0];
    let strikeArray = [0];
    
    let embed = new Discord.MessageEmbed()
      .setTitle('Baseball Match')
      .addField(`Striker - ${striker.username}`, 
        'Score: 0\nNo. Of Strikes: 0'
      )
      .addField(`Pitcher - ${pitcher.username}`, (target || 0))
      .setColor(embedColor);
    
    const strikerDM = (await striker.send(embed)).channel;
    const pitcherDM = (await pitcher.send(embed)).channel;
    
    pitchCollect();
    strikeCollect();
    
    async function pitchCollect() {
      pitcherDM.awaitMessages(
        msg => msg.author.id === pitcher.id,
        {
          time: 45000,
          max: 1,
          errors: ['time']
        }
      ).then(collected => {
        if (isInnings2 == 'over' || isInnings2 && !target) return;
        
        const msg = collected.first();
        let { content } = msg;
        let c = content.toLowerCase().trim();
        
        if (isNaN(c)) {
          striker.send(`\`${pitcher.username}:\` ${content}`);
          return pitchCollect();
        } else if (strikeArray.length < pitchArray.length) {
          pitcher.send('Wait for the striker to hit.');
          return pitchCollect();
        } else if (c > 6 || c < 1) {
          pitcher.send('This match is limited to 1-6');
          return pitchCollect();
        } else {
          pitchArray.push(parseInt(c));
          pitcher.send('You pitched ' + c);
          striker.send('Pitch is coming');
          return pitchCollect();
        }
      }).catch(async e => {
        if (isInnings2 == 'over') return;
        isInnings2 = 'over';
        pitcher.send('Match ended as you were inactive');
        striker.send('Match ended as the pitcher was inactive');
        
        console.log(e);
        await changeStatus(striker, false);
        await changeStatus(pitcher, false);
        return;
      });
    }
    
    async function strikeCollect(run) {
      strikerDM.awaitMessages(
        msg => msg.author.id === striker.id,
        {
          time: 45000,
          max: 1,
          errors: ['time']
        }
      ).then(async collected => {
        if (isInnings2 == 'over' || isInnings2 && !target) return;
        
        const msg = collected.first();
        
        let striked = strikeArray.slice(-1)[0];
        let pitched = pitchArray.slice(-1)[0];
        
        let { content } = msg;
        let c = content.toLowerCase().trim();
        
        if (isNaN(c)) {
          pitcher.send(`\`${striker.username}:\` ${content}`);
          return strikeCollect();
        } else if (strikeArray.length === pitchArray.length) {
          striker.send('Wait for the pitch');
          return strikeCollect();
        } else if (c > 6 || c < 1) {
          striker.send('This match is limited to 1-6');
          return strikeCollect();
        } else if (c - pitched === 1 || c - pitched === -1) {
          if (run) base = 1;
          
          strikes += 1;
          strikeArray.push(strikeArray.slice(-1)[0]);
          
          if (run) {
            c = `${c}, Striker is in base **${base}**`;
          }
          
          if (strikes === 3) {
            if(!target) {
              isInnings2 = true;
              pitcher.send('Striker is out! Next round starts!');
              striker.send('Out! Next round starts!');
              return start(pitcher, striker, strikeArray.slice(-1)[0]);
            } else {
              isInnings2 = 'over';
              pitcher.send('You won!');
              striker.send('You lost');
              return;
            }
          } else {
            embed.files = [strikePath];
            embed
              .spliceFields(0, 2)
              .addField(`Striker - ${striker.username}`, 
                `Score: ${strikeArray.slice(-1)[0]}\nNo. Of Strikes: ${strikes}`
              )
              .addField(`Pitcher - ${pitcher.username}`, (target || 0))
              .setImage(`attachment://${strikePath.split('/').pop()}`)
            
            pitcher.send('Strike ' + strikes + '. The striker missed it', embed);
            striker.send('Strike ' + strikes + `. Ouch you missed it.${run || ''}`, embed);
          }
          return strikeCollect();
        } else if (target && (striked + parseInt(c) * 2) > target) {
          if (c != pitched && (striked + parseInt(c)) <= target) {
            return;
          } else if (striked == pitched) {
            strikeArray.push(parseInt(c) * 2);
          } else {
            strikeArray.push(parseInt(c));
          }
          
          embed.files = [];
          embed
            .spliceFields(0, 2)
            .addField(`Striker - ${striker.username}`, 
              `Score: ${strikeArray.slice(-1)[0]}\nNo. Of Strikes: ${strikes}`
            )
            .addField(`Pitcher - ${pitcher.username}`, (target || 0))
          
          pitcher.send('You lost.', embed);
          striker.send('You won!', embed);
          isInnings2 = 'over';
          return;
        }
        
        if (c == pitched) {
          if (run) base = 1;
          
          c = parseInt(c) * 2;
          strikeArray.push(strikeArray.slice(-1)[0] + parseInt(c));
          
          if (run) {
            c = `${c}, Striker is in base **${base}**`;
          }
          
          embed.files = [homerunPath];
          embed
            .spliceFields(0, 2)
            .addField(`Striker - ${striker.username}`, 
              `Score: ${strikeArray.slice(-1)[0]}\nNo. Of Strikes: ${strikes}`
            )
            .addField(`Pitcher - ${pitcher.username}`, (target || 0))
            .setImage(`attachment://${homerunPath.split('/').pop()}`)
          
          pitcher.send('HomeRun!', embed);
          striker.send(`HomeRun! Perfect Shot!${run || ''}`, embed);
          return strikeCollect();
        } else {
          strikeArray.push(striked + parseInt(c));
          
          if (run) base += 1;
          if (base === 4) {
            strikeArray.splice(strikeArray.length - 1, 1, striked + parseInt(c) + 10);
            c = `${c}, Bonus 10 for reaching base 4!`;
            base = 1;
          } else if (run) {
            c = `${c}, Striker is in base **${base}**`;
          }
          
          embed.files = [hitPath];
          embed
            .spliceFields(0, 2)
            .addField(`Striker - ${striker.username}`, 
              `Score: ${strikeArray.slice(-1)[0]}\nNo. Of Strikes: ${strikes}`
            )
            .addField(`Pitcher - ${pitcher.username}`, (target || 0))
            .setImage(`attachment://${hitPath.split('/').pop()}`)
          
          await striker.send('You hit ' + c, embed);
          await pitcher.send('Striker hit ' + c, embed);
          const runPrompt = await askForRun();
          return strikeCollect(runPrompt);
        }
      }).catch(async e => {
        if (isInnings2 == 'over') return;
        isInnings2 = 'over';
        striker.send('Match ended as you were inactive');
        pitcher.send('Match ended as the striker was inactive');
        
        console.log(e);
        await changeStatus(striker, false);
        await changeStatus(pitcher, false);
        return;
      });
      
      async function askForRun() {
        try {
          const msg = await striker.send(`Do you want to run to base ${base + 1} next pitch? \`You will get 10 runs as bonus at base 4.\``);
          await msg.react('✅');
        
          const reaction = (await msg.awaitReactions(
            r => r.user.id === striker.id,
            {
              time: 10000,
              max: 1,
              errors: ['time']
            }
          )).first();
          if (reaction.emoji.name === '✅') {
            return ' Your run streak got reset to main base 1.';
          } else {
            return;
          }
        } catch (e) {
          await msg.react('❌');
          return console.log(e);
        }
      }
    }
  }
};

async function changeStatus(user, boolean) {
  if(typeof boolean !== 'boolean') return;
  
  await db.findOneAndUpdate({ _id: user.id }, {
    $set: {
      status: boolean,
    }
  });
}