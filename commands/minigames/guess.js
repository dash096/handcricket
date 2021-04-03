const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const gainExp = require('../../functions/gainExp.js');

module.exports = {
  name: 'guess',
  aliases: ['guesstheno', 'gtn'],
  description: 'Guess The Number! Train your brain!',
  category: 'Minigames',
  syntax: 'e.guess',
  cooldown: 60,
  run: async (message, args, prefix, client, train) => {
    const coinEmoji = (await getEmoji)[0];
    const pixel = (await getEmoji)[4];
    
    const data = await db.findOne({_id: message.author.id});
    if(!data) return message.channel.reply('Do `e.start` before playing.');
    
    const start = (Math.random() * 100).toFixed(0);
    const end = parseInt(start) + 10;
    const array = await getArray(parseInt(start));
    const number = array[Math.floor(Math.random() * array.length)];
    let lives = 3;
    
    const embed = new Discord.MessageEmbed()
      .setTitle(`Guess The Number! ${pixel} ${pixel} ${pixel}`)
      .setColor('BLUE')
      .setDescription(`**You got 3 lives to guess the number in my mind!**\n That number is between ${start} and ${end}.`)
      .setFooter('I am playing with ' + message.author.tag);
      
    await message.channel.send(embed);
    
    const toReturn = await play();
    return toReturn;
    
    async function play() {
      const collected = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
        max: 1,
        time: 30000,
        errors: ['time']
      });
      const randoCoins = (Math.random() * 464).toFixed(0);
      const msg = collected.first();
      const { content, author, channel } = msg;
      const guess = content;
      let win = false;
    
      const edit = new Discord.MessageEmbed()
       .setTitle('Guess the Number ' + `${await getLives(lives)}`)
       .setDescription(`**You got ${lives} more  to guess the number in my mind!**\n That number is between ${start} and ${end}.`)
       .setColor('BLUE')
       .setFooter('Im playing with ' + author.tag);
     
      if(guess.toLowerCase() == 'end') {
        channel.send('Game Ended');
        await channel.send(`You got some experience.`);
        await gainExp(data, 0.5, message);
        return [message, win, 0];
      } else if(isNaN(guess)) {
        lives -= 1;
        edit.setDescription('Wrong answer! ' + `\`guess\`` + ' is not even a number!');
        channel.send(edit);
        if(lives == 0) {
          channel.send('You lost! I thought of ' + number);
          await gainExp(data, 2, message);
          return [message, win, randoCoins];
        }
        return play();
      } else if (guess == number) {
        edit.setDescription('Correct Answer! You are good at guessing!');
        channel.send(edit);
        if(train == true) channel.reply(`You got ${randoCoins} as Training rewards!`);
        await gainExp(data, 3, message);
        win = true;
        return [message, win, randoCoins];
      } else {
        lives -= 1;
        edit.setDescription('Wrong answer! ' + guess + ` is ${getGteLte(guess,  number)} the number I thought!`);
        channel.send(edit);
        if(lives == 0) {
          channel.send('You lost! I thought of ' + number);
          await gainExp(data, 2, message);
          return [message, win, randoCoins];
        }
        return play();
      }
    }
  }
};

async function getArray(start) {
  const arr = [];
  await arr.push(start);
  await arr.push(start + 1);
  await arr.push(start + 2);
  await arr.push(start + 3);
  await arr.push(start + 4);
  await arr.push(start + 5);
  await arr.push(start + 6);
  await arr.push(start + 7);
  await arr.push(start + 8);
  await arr.push(start + 9);
  return arr;
}

async function getLives(lives) {
 let i;
 const pixel = (await getEmoji)[4];
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