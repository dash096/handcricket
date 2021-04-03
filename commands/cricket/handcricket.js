const db = require("../../schemas/player.js");
const Discord = require("discord.js");


//To fix awaitMessages collevtion error
let fixErrors = true;

module.exports = {
  name: "handcricket",
  aliases: ["hc", "cricket"],
  description: "Play handcricket with a user",
  category: 'Cricket',
  syntax: 'e.handcricket @user --post (to post scores in channel)',
  cooldown: 10,
  run: async (message, args, prefix) => {
    //Players
    const user = message.author;
    const target = message.mentions.users.first();

    //Target Validation
    if (!target || target.bot || target.id === user.id) {
      message.reply("Invalid opponent.");
      return;
    }

    const userdata = await db.findOne({
      _id: user.id
    }).catch((e) => {
      console.log(e);
    });
    
    const targetdata = await db.findOne({
      _id: target.id
    }).catch((e) => {
      console.log(e);
    });

    //Data Validation
    if (!userdata) {
      message.reply(user.tag + " is not a player. Do `" + prefix + "start`");
      return;
    }
    if (!targetdata) {
      message.reply(target.tag + " is not a player. Do `" + prefix + "start`");
      return;
    }

    //Status Validation
    if (userdata.status === true) {
      message.reply(user.username + " is already in a match");
      return;
    }
    if (targetdata.status === true) {
      message.reply(target.username + " is already in a match");
      return;
    }
    
    //Fix errors on collectin
    setTimeout(async () => {
      if(fixErrors == true) {
        await changeStatus(user, false);
        await changeStatus(target, false);
      }
    }, 15000);
    
    await changeStatus(user, true);
    await changeStatus(target, true);
    
    let post = false;
    if(message.content.toLowerCase().includes('--post')) {
      post = true;
    }

    //Toss
    const roll = Math.floor(Math.random());
    let batsman;
    let bowler;
    
    await message.channel.send(`<@${target.id}> so do you wanna play with **${user.username}**? Type \`y\`/\`n\` in 30s`);
    
    async function checkWill() {
      try {
        const msgs = await message.channel.awaitMessages(m => m.author.id === target.id, {
          max: 1,
          time: 30000,
          errors: ['time']
        });
        const c = msgs.first().content;
        if(c.trim().toLowerCase() == 'y' || c.trim().toLowerCase() == 'yes') {
          return true;
        }
        else {
          message.channel.send(`Match aborted`);
          await changeStatus(user, false);
          await changeStatus(target, false);
          return;
        }
      } catch {
        message.channel.send('Times up');
        await changeStatus(user, false);
        await changeStatus(target, false);
        return;
      }
    }
    
    const will = await checkWill();
    
    if(will === true) {
      if(post === false) {
        try {
          await message.reply('**POST SCORES?**\n If you have any frnds online rn, and if you want them to see the match score, type `yes` else, type something to continue.');
          const msgs = await message.channel.awaitMessages( m => m.author.id === user.id, {
            max: 1,
            time: 30000
          })
          const msg = msgs.first();
          if(msg.content.trim().toLowerCase() == 'y' || msg.content.trim().toLowerCase() == 'yes') {
            post = true;
          } else {
            post = false;
          }
          await rollToss(post);
        } catch(e) {
          console.log(e);
          msg.channel.send('uhh, I guess you are offline. Match aborted.');
          await changeStatus(user, false);
          await changeStatus(target, false);
          return;
        };
      }
    }
    
    async function rollToss(post) {
      //User High Toss
      if (user.tossMulti > target.tossMulti) {
        //Users with roll.
        if (roll < user.tossMulti) {
          message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
          userWon(message, user, target, post);
        }

        //Target wins with roll.
        if (roll >= user.tossMulti) {
          message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
          targetWon(message, user, target, post);
        }
      }

      //Target High Toss
      if (user.tossMulti < target.tossMulti) {
        //Target wins with roll
        if (roll < target.tossMulti) {
          message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
          targetWon(message, user, target, post);
        }

        //User wins with roll
        if (roll >= target.tossMulti) {
          message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
          userWon(message, user, target, post);
        }
      }

      //Equal Multi Toss
      if (target.tossMulti === user.tossMulti) {
        const roll2 = Math.floor(Math.random() * 3);

        if (roll2 === 1) { //User wins
          message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
          userWon(message, user, target, post);
        }

        if (roll2 === 2) { //Target wins
          message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
          targetWon(message, user, target, post);
        }
      }
    }
    fixErrors = false;
  }
};

async function start(message, batsman, bowler, post) {
  await message.channel.send(`${batsman} and ${bowler}, get to your dms to play!`);

  const firstInnings = require("../../functions/innings1.js");
  
  await db.findOneAndUpdate( { _id: batsman.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  
  await db.findOneAndUpdate( { _id: bowler.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  fixErrors = false;
  firstInnings(batsman, bowler, message, post);
}

async function userWon(message, user, target, post) {
  try {
    const msgs = await message.channel.awaitMessages(
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
      return message.channel.send('Aborted');
    } else {
      m.reply("Type either `batting` or `bowling`");
      return userWon(message, user, target);
    }
    await message.channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler, post);
  } catch (e) { 
    if (e) message.channel.send('Time\'s up!');
  }
  
}

async function targetWon(message, user, target, post) {
    try {
      const msgs = await message.channel.awaitMessages(
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
        return message.channel.send('Aborted');
      } else {
        m.reply("Type either `batting` or `bowling`");
        return targetWon(message, user, target);
      }
      await message.channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
      start(message, batsman, bowler, post);
    } catch (e) { 
        message.channel.send('Time\'s up!');
    }
  }
  
async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}})
}