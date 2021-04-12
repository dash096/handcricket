const db = require("../../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../../functions/getErrors.js');
const getEmoji = require('../../index.js');

let fixStatus = true;

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
    await changeStatus(user, true);
    await changeStatus(target, true);
    
    //Check if to post socres in the channel.
    let post = false;
    if(content.toLowerCase().includes('--post')) {
      post = true;
    }

    //Toss
    const roll = Math.floor(Math.random());
    let batsman;
    let bowler;
    
    await channel.send(`<@${target.id}> Do you wanna play with **${user.username}**? Type \`y\`/\`n\` in 30s`);
    
    function careful() {
      setTimeout(() => {
        if(fixStatus == true) {
          changeStatus(user, false);
          changeStatus(target, false);
        } else {
          return;
        }
      },20000);
    }
    
    //Execute check will
    const will = await checkWill();
    
    //Ask the target if he wants to duel.
    async function checkWill() {
      try {
        careful();
        const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
          max: 1,
          time: 17000,
          errors: ['time']
        });
        const msg = msgs.first();
        const c = msg.content;
        
        if(c.trim().toLowerCase() == 'y' || c.trim().toLowerCase() == 'yes') {
          return true;
        }
        else if(c.trim().toLowerCase() == 'n' || c.trim().toLowerCase() == 'no'){
          channel.send(`Match aborted`);
          await changeStatus(user, false);
          await changeStatus(target, false);
          return false;
        } else {
          msg.reply(`Type either \`y\`/\`n\``);
          return await checkWill();
        }
      } catch(e) {
        console.log(e);
        let error = 'time';
        channel.send(getErrors({error}));
        await changeStatus(user, false);
        await changeStatus(target, false);
        return;
      }
    }
    
    //If will is true, roll the toss
    if(will === true) {
      try {
        await rollToss(post);
      } catch(e) {
        console.log(e);
        await changeStatus(user, false);
        await changeStatus(target, false);
        return;
      }
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
        }

        //Target wins with roll.
        if (roll >= user.tossMulti) {
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          targetWon(message, user, target, post);
        }
      }

      //Target High Toss
      if (user.tossMulti < target.tossMulti) {
        //Target wins with roll
        if (roll < target.tossMulti) {
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          targetWon(message, user, target, post);
        }

        //User wins with roll
        if (roll >= target.tossMulti) {
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          userWon(message, user, target, post);
        }
      }

      //Equal Multi Toss
      if (target.tossMulti === user.tossMulti) {
        const roll2 = Math.floor(Math.random() * 3);

        if (roll2 === 1) { //User wins
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${user} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          userWon(message, user, target, post);
        }

        if (roll2 === 2) { //Target wins
          const rolling = await channel.send(`Rolling the ${tossEmoji} Lucky Coin....`);
          setTimeout( () => {
            rolling.edit(`${target} won the toss, type either \`batting\` or \`bowling\` or \`end\``);
          }, 3000);
          targetWon(message, user, target, post);
        }
      }
    }
  }
};

async function start(message, batsman, bowler, post) {
  const { content, author, channel, mentions } = message;
  
  await channel.send(`${batsman} and ${bowler}, get to your dms to play!`);

  const firstInnings = require("../../functions/innings1.js");
  
  await db.findOneAndUpdate( { _id: batsman.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  
  await db.findOneAndUpdate( { _id: bowler.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  firstInnings(batsman, bowler, message, post);
  fixStatus = false;
}

async function userWon(message, user, target, post) {
  const { content, author, channel, mentions } = message;
    
  try {
    const msgs = await channel.awaitMessages(
      m => m.author.id === user.id, { max: 1, time: 20000, errors: ['time'] }
    );
  
    const m = msgs.first();
    if (m.content.toLowerCase().trim() === "batting") {
      batsman = user;
      bowler = target;
    }
    else if (m.content.toLowerCase().trim() === "bowling") {
      batsman = target;
      bowler = user;
    }
    else if (m.content.toLowerCase().trim() === "end" || m.content.toLowerCase().trim() === "cancel" || m.content.toLowerCase().trim() === "exit") {
      return channel.send('Aborted');
    } else {
      m.reply("Type either `batting` or `bowling`");
      return userWon(message, user, target);
    }
    await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler, post);
  } catch (e) {
    console.log(e);
    let error = 'time';
    channel.send(getErrors({error}));
  }
  
}

async function targetWon(message, user, target, post) {
    const { content, author, channel, mentions } = message;
    
    try {
      const msgs = await channel.awaitMessages(
        m => m.author.id === target.id, { max: 1, time: 20000, errors: ['time'] }
      );
      const m = msgs.first();
      if (m.content.toLowerCase().trim() === "batting") {
        batsman = target;
        bowler = user;
      }
      else if (m.content.toLowerCase().trim() === "bowling") {
        batsman = user;
        bowler = target;
      } else if (m.content.toLowerCase().trim() === "end" || m.content.toLowerCase().trim() === "cancel" || m.content.toLowerCase().trim() === "exit") {
        return channel.send('Aborted');
      } else {
        m.reply("Type either `batting` or `bowling`");
        return targetWon(message, user, target);
      }
      await channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
      start(message, batsman, bowler, post);
    } catch (e) {
      console.log(e);
      let error = 'time';
      channel.send(getErrors({error}));
    }
  }
  
async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}})
}