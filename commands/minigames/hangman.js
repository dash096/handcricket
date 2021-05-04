const Discord = require('discord.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const gainExp = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'hangman',
  aliases: ['guesstheword', 'gtw'],
  description: 'Guess The Word! Train your brain!',
  category: 'Minigames',
  syntax: 'e.hangman',
  status: true,
  cooldown: 60,
  run: async ({message, client, getTrain}) => {
    const { author, channel, content, mentions } = message;
    const coinEmoji = await getEmoji('coin');
    const coins = (Math.random() * 363).toFixed(0);
    
    const data = await db.find({_id: author.id});
    if(!data) {
      return message.reply(getErrors({error: 'data', user: author}));
    } else if (data.status === true) {
      return message.reply(getErrors({error: 'engaged', user: author}));
    }
    await db.findOneAndUpdate({_id: author.id}, {status: true});
    
    const words = ['cricket', 'msdhoni', 'eagle'];
    const word = words[Math.floor(Math.random() * words.length)];
    const splitted = word.split('');
    const revealed = [];
    let wordLives = 2;
    let letterLives = 3;
    
    splitted.forEach(() => {
      revealed.push('_');
    });
    
    //Reveal some letters
    reveal(); 
    reveal();
    if(Math.random() < 0.1) {
      reveal();
    }
    
    function reveal() {
      let letter = splitted[Math.floor(Math.random() * splitted.length)];
      revealed.splice(splitted.indexOf(letter), 1, letter);
    }
    
    await channel.send('Guess the upcoming word with the revealled characters, you can type a character to see if it exists in the word.');
    await channel.send(`\`${revealed.join(' ')}\``);
    await awaitAnswers();
    
    async function awaitAnswers() {
      try {
        const answer = (await channel.awaitMessages(
          message => message.author.id === author.id, {
            time: 30000,
            max: 1,
            errors: ['time']
          })).first().content; 
        
        if(answer.length === 1) letterLives -= 1;
        else wordLives -= 1;
          
        if(answer == splitted.join('')) {
          //rewards
          channel.send('Correct Answer!');
          return;
        } else if(splitted.find(char => char == answer)) {
          //reveal the char
          revealed.splice(splitted.indexOf(answer), 1, answer);
          channel.send(`\`${revealed.join(' ')}\``);
          return awaitAnswers();
        } else {
          //try again
          if(wordLives === 0 || letterLives === 0) return channel.send('Better luck next time :)');
          channel.send(`\`${revealed.join(' ')}\`` + ' Try again');
          return awaitAnswers();
        }
        
      } catch (e) {
        //timeup
        console.log(e);
        channel.send(getErrors({error: 'time'}));
        return;
      } finally {
        await db.findOneAndUpdate({_id: author.id}, {$set: {status: false}});
        //Set Cooldown
        if(!getTrain) {
          const timestamps = client.cooldowns.get('hangman');
          timestamps.set(author.id, Date.now());
          setTimeout(() => timestamps.delete(author.id), 60 * 1000);
        }
      }
    }
  }
};