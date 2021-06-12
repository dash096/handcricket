const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');

module.exports = async (client, message, striker, pitcher, post) => {
  
  const { channel } = message;
  let isInnings2;
  
  start(striker, pitcher);
  async function start(striker, pitcher, target) {
    if (isInnings2 == 'over' || isInnings2 && !target) return;
    
    let strikes = 0;
    let pitchArray = [0];
    let strikeArray = [0];
    
    let embed = new Discord.MessageEmbed()
      .setTitle('Baseball Match')
      .addField(`Striker - ${striker.username}`, 0)
      .addField(`Pitcher - ${pitcher.username}`, (target || 0))
      .setColor(embedColor);
    
    const strikerDM = (await striker.send(embed)).channel;
    const pitcherDM = (await pitcher.send(embed)).channel;
    
    pitchCollect();
    strikeCollect();
    async function pitchCollect() {
      const pitcherDM = (await pitcher.send(embed)).channel;
      
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
    
    async function strikeCollect() {
      strikerDM.awaitMessages(
        msg => msg.author.id === striker.id,
        {
          time: 45000,
          max: 1,
          errors: ['time']
        }
      ).then(collected => {
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
        } else if (c === pitched) {
          c = parseInt(c) * 2;
          embed
            .spliceFields(0, 2)
            .addField(`Striker - ${striker.username}`, strikeArray.slice(-1)[0])
            .addField(`Pitcher - ${pitcher.username}`, (target || 0))
            
          pitcher.send('HomeRun!', embed);
          striker.send('HomeRun!', embed);
        } else if (c - pitched === 1 || c - pitched === -1) {
          strikes += 1;
          if (strikes === 3) {
            isInnings2 = true;
            pitcher.send('Striker is out! Next round starts!');
            striker.send('Out! Next round starts!');
            return start(pitcher, striker, strikeArray.slice(-1)[0]);
          } else {
            embed
              .spliceFields(0, 2)
              .addField(`Striker - ${striker.username}`, strikeArray.slice(-1)[0])
              .addField(`Pitcher - ${pitcher.username}`, (target || 0))
            
            pitcher.send('Strike ' + strikes, embed);
            striker.send('Strike ' + strikes, embed);
          }
          return strikeCollect();
        } else {
          strikeArray.push(striked + parseInt(c));
          
          embed
            .spliceFields(0, 2)
            .addField(`Striker - ${striker.username}`, strikeArray.slice(-1)[0])
            .addField(`Pitcher - ${pitcher.username}`, (target || 0))
          
          striker.send('You hit ' + c, embed);
          pitcher.send('Striker hit ' + embed);
          return strikeCollect();
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