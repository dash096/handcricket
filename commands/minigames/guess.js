const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const gainExp = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'guess',
  aliases: ['guesstheno', 'gtn'],
  description: 'Guess The Number! Train your brain!',
  category: 'Minigames',
  syntax: 'e.guess',
  status: true,
  run: async ({message, client, getTrain}) => {
    const { content, author, channel, mentions } = message;
    
    try {
      //Emojis
      const coinEmoji = await getEmoji('coin');
      const pixel = await getEmoji('pixelHeart');
    
      let train = getTrain || false;
    
      //Data Validation
      const data = await db.findOne({_id: author.id});
      let user = author; let error = 'data';
      if(!data) return channel.reply(getErrors({error , user}));
    
      await db.findOneAndUpdate({_id: author.id}, { $set: { status: true} } );
    
      //Numbers
      const between = 12;
      const start = Math.floor(Math.random() * 100);
      const end = start + between;
      const array = await getArray(start, between);
      const number = array[Math.floor(Math.random() * array.length)];
      let lives = 3;
    
      //Send Embed
      const embed = new Discord.MessageEmbed()
        .setTitle(`Guess The Number! ${pixel} ${pixel} ${pixel}`)
        .setColor(embedColor)
        .setDescription(`**You got 3 lives to guess the number in my mind!**\n That number is between ${start} and ${end}.`)
        .setFooter('I am playing with ' + author.tag);
      
      await channel.send(embed);
    
      await play();
      
      //Set cooldown
      if(!train) {
        const timestamps = client.cooldowns.get('guess');
         timestamps.set(author.id, Date.now());
        setTimeout(() => timestamps.delete(author.id), 60 * 1000);
      }
      
      async function play() {
        const collected = await channel.awaitMessages(msg => msg.author.id === author.id, {
          max: 1,
          time: 30000,
          errors: ['time']
        });
        const msg = collected.first();
        const guess = msg.content;
        
        const edit = new Discord.MessageEmbed()
          .setTitle('Guess the Number ' + `${await getLives(lives)}`)
          .setDescription(`**You got ${lives} more  to guess the number in my mind!**\n That number is between ${start} and ${end}.`)
          .setColor(embedColor)
          .setFooter('Im playing with ' + author.tag);
     
        if(guess.toLowerCase() == 'end') {
          channel.send('Game Ended');
          await channel.send(`You got some experience.`);
          await gainExp(data, 0.5, message);
          return;
        } else if(isNaN(guess)) {
          lives -= 1;
          edit.setDescription('Wrong answer! ' + `\`${guess}\`` + ' is not even a number!');
          channel.send(edit);
          if(lives === 0) {
            channel.send('You lost! I thought of ' + number);
            await gainExp(data, 2, message);
            return;
          } else {
            return play();
          }
        } else if (guess == number) {
          edit.setDescription('Correct Answer! You are good at guessing!');
          channel.send(edit);
          await gainExp(data, 3, message);
          return;
        } else {
          lives -= 1;
          edit.setDescription('Wrong answer! ' + guess + ` is ${getGteLte(guess,  number)} the number I thought!`);
          channel.send(edit);
          if(lives == 0) {
            channel.send('You lost! I thought of ' + number);
            await gainExp(data, 2, message);
            return;
          }
          return play();
        }
      }
    } catch (e) {
      let error = 'time';
      channel.send(getErrors({error}));
    } finally {
      await db.findOneAndUpdate( { _id: author.id }, { $set: { status: false} });
      return;
    }
  }
};

async function getArray(start, more) {
  const arr = [];
  
  let i;
  for(i = 0; i < more; i++) {
    start += 1;
    arr.push(start);
  }
  return arr;
}

async function getLives(lives) {
 let i;
 const pixel = await getEmoji('pixelHeart');
 let text = ``;
 for(i = 0; i < (lives - 1); i++) {
   text += `${pixel} `;
 }
 return text;
}

function getGteLte(guess, number) {
  if(parseInt(guess) > number) {
    return '**greater than**';
  } else if (parseInt(guess) < number) {
    return '**smaller than**';
  }
}