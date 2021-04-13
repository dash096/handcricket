const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../../functions/getErrors.js');
const getEmoji = require('../../index.js');

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket"],
  description: "Play handcricket with a user",
  category: 'Cricket',
  syntax: 'e.handcricket @user --post (to post scores in channel)',
  status: true,
  cooldown: 10,
  run: async ({message}) => {
    const tossEmoji = await getEmoji('toss');
    const { content, author, channel, mentions } = message;
    //Players
    const user = author;
    const target = mentions.users.first();

    //Target Validation
    if (!target || target.bot || target.id === user.id) {
      message.reply("Invalid opponent.");
      return;
    }

    const userdata = await db.findOne({
      _id: user.id
    });
    const targetdata = await db.findOne({
      _id: target.id
    });
    
    //Change status to avoid 2 matchs at same time
    await changeStatus(user, true, target);
    
    //Toss
    const roll = Math.floor(Math.random());
    
    let batsman;
    let bowler;
    let post = false; //Check if to post socres in the channel.

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
        
        if(content.toLowerCase().includes('--post') || c.includes('--post')) post = true;
        
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
      } catch(e) {'
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
        await changeStatus(user, false, target);
        return console.log(e);
      }
    } else {
      await changeStatus(user, false, target);
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
        } else if (roll >= user.tossMulti) {//Target wins with roll.
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
        } else if (roll >= target.tossMulti) {//User wins with roll
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
        } else if (roll2 === 2) { //Target wins
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          targetWon(message, user, target, post);
        }
      } else {
        channel.send('Something went wrong, try again');
        await changeStatus(user, false, target);
      }
    }
  }
};

async function start(message, batsman, bowler, post) {
  const { content, author, channel, mentions } = message;
  
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);
  changeStatus(batsman, true, bowler);
  
  const firstInnings = require("../../functions/innings1.js");
  firstInnings(batsman, bowler, message, post);'
}

async function userWon(message, user, target, post) {
  const { content, author, channel, mentions } = message;
    
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === user.id, { max: 1, time: 20000, errors: ['time'] }
    );
  
    const m = msgs.first();
    const c = m.content.toLowerCase().trim();
    
    if (c == "batting") {
      batsman = user;
      bowler = target;
    }
    else if (c == "bowling") {
      batsman = target;
      bowler = user;
    }
    else if (c == "end" || c == "cancel" || c == "exit") {
      changeStatus(user, false, target);
      return channel.send('Aborted');
    } else {
      m.reply("Type either `batting` or `bowling`");
      return userWon(message, user, target);
    }
    await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler, post);
  } catch (e) {
    changeStatus(user, false, target);
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
        changeStatus(user, false, target);
        return channel.send('Aborted');
      } else {
        m.reply("Type either `batting` or `bowling`");
        return targetWon(message, user, target);
      }
      await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
      start(message, batsman, bowler, post);
    } catch (e) {
      changeStatus(user, false, target);
      let error = 'time';
      channel.send(getErrors({error}));
      return console.log(e);
    }
  }
  
async function changeStatus(a, boolean, b) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
  if(b) await db.findOneAndUpdate({_id: b.id}, { $set: {status: boolean}});
}