const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./innings1.js");

module.exports = async (message, user, target) => {
  const tossEmoji = await getEmoji('toss');
  const { content, author, channel, mentions } = message;
    
  //Toss
  const roll = Math.floor(Math.random());
    
  let batsman;
  let bowler;
    
  //Check if to post socres in the channel.
  let post = false;
  if(content.toLowerCase().includes('post')) post = true;
    
  await channel.send(`<@${target.id}> Do you wanna play with **${user.username}**? Type \`y\`/\`n\` in 30s\n Append(add to the end) \`--post\` to the message to post the scores in this channel`);
    
  //Execute check will
  const will = await checkWill();
    
  //Ask the target if he wants to duel.
  async function checkWill() {
    try {
      const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
        max: 1,
        time: 17000,
        errors: ['time']
      });
      const msg = msgs.first();
      const c = msg.content.trim().toLowerCase();
      
      if(c.includes('post')) post = true;
        
      if(c.startsWith('y')) {
        return true;
      }
      else if(c.startsWith('n')){
        msg.reply(`Match aborted`);
        return false;
      } else {
        msg.reply(`Type either \`y\`/\`n\``);
        return await checkWill();
      }
    } catch(e) {
      let error = 'time';
      channel.send(getErrors({error}));
      return console.log(e);
    }
  }
    
  //If will is true, roll the toss
  if(will === true) {
    try {
      await rollToss(post);
    } catch(e) {
      await changeStatus(user, false);
      await changeStatus(target, false);
      return console.log(e);
    }
  } else {
    await changeStatus(user, false);
    await changeStatus(target, false);
    return;
  }
    
  async function rollToss(post) {
    //User High Toss
    if (user.tossMulti > target.tossMulti) {
      //Users with roll.
      if (roll < user.tossMulti) {
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        userWon(message, user, target, post);
      } else {//Target wins with roll.
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        targetWon(message, user, target, post);
      }
    }

    //Target High Toss
    else if (user.tossMulti < target.tossMulti) {
      //Target wins with roll
      if (roll < target.tossMulti) {
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        targetWon(message, user, target, post);
      } else {//User wins with roll
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        userWon(message, user, target, post);
      }
    }

    //Equal Multi Toss
    else if (target.tossMulti === user.tossMulti) {
      const roll2 = Math.floor(Math.random() * 3);

      if (roll2 === 1) { //User wins
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        userWon(message, user, target, post);
      } else { //Target wins
        const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
        setTimeout( () => {
          rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
        }, 3000);
        targetWon(message, user, target, post);
      }
    } else {//Target wins
      const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
      setTimeout( () => {
          rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
      }, 3000);
      targetWon(message, user, target, post);
    }
  }
};
async function start(message, batsman, bowler, post) {
  const { content, author, channel, mentions } = message;
  
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);
  await changeStatus(batsman, true);
  await changeStatus(bowler, true);
  firstInnings(batsman, bowler, message, post);
}

async function userWon(message, user, target, post) {
  const { content, author, channel, mentions } = message;
  
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === user.id, { max: 1, time: 20000, errors: ['time'] }
    );
  
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
    
    if (c.startsWith("bat")) {
      batsman = user;
      bowler = target;
    }
    else if (c.startsWith("bowl")) {
      batsman = target;
      bowler = user;
    }
    else if (c == "end" || c == "cancel" || c == "exit") {
      await changeStatus(target, false);
      await changeStatus(user, false);
      return channel.send('Aborted');
    } else {
      m.reply("Type either `batting` or `bowling`");
      return userWon(message, user, target);
    }
    await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler, post);
  } catch (e) {
    await changeStatus(user, false);
    await changeStatus(target, false);
    let error = 'time';
    channel.send(getErrors({error}));
    return console.log(e);
  }
  
}

async function targetWon(message, user, target, post) {
    const { content, author, channel, mentions } = message;
    
    try {
      const msgs = await channel.awaitMessages(
        m => m.author.id === target.id, { max: 1, time: 20000, errors: ['time'] }
      );
      const m = msgs.first();
      const c = m.content.toLowerCase().trim();
      
      if (c == "batting") {
        batsman = target;
        bowler = user;
      }
      else if (c == "bowling") {
        batsman = user;
        bowler = target;
      } else if (c == "end" || c == "cancel" || c == "exit") {
        await changeStatus(user, false);
        await changeStatus(target, false);
        return channel.send('Aborted');
      } else {
        m.reply("Type either `batting` or `bowling`");
        return targetWon(message, user, target);
      }
      await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
      start(message, batsman, bowler, post);
    } catch (e) {
      await changeStatus(user, false);
      await changeStatus(target, false);
      let error = 'time';
      channel.send(getErrors({error}));
      return console.log(e);
    }
  }
  
async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
}