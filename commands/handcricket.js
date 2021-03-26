const db = require("../schemas/player.js");
const Discord = require("discord.js");

module.exports = {
  name: "handcricket",
  aliases: ["hc",
    "cricket"],
  description: "Play handcricket with a user",
  category: "handcricket",
  run: async ({
    message
  }) => {
    //Players
    const user = message.author;
    const target = message.mentions.users.first();

    //Target Validation
    if (!target || target.bot || target.id === user.id) {
      message.reply("Invalid opponent, `!handcricket <@user>`");
      return;
    }

    //get Database
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

    //Validate Database
    if (!userdata) {
      message.reply(user.tag + " is not a player. Do `!start`");
      return;
    }
    if (!targetdata) {
      message.reply(target.tag + " is not a player. Do `!start`");
      return;
    }

    //Status Validation
    /*if (userdata.status === true) {
      message.reply(user.username + " is already in a match");
      return;
    }
    if (targetdata.status === true) {
      message.reply(target.username + " is already in a match");
      return;
    }*/

    //Toss
    const roll = Math.floor(Math.random());
    let batsman;
    let bowler;

    //User High Toss
    if (user.tossMulti > target.tossMulti) {
      //Users with roll.
      if (roll < user.tossMulti) {
        message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
        userWon(message, user, target);
      }

      //Target wins with roll.
      if (roll >= user.tossMulti) {
        message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
        targetWon(message, user, target);
      }
    }

    //Target High Toss
    if (user.tossMulti < target.tossMulti) {
      //Target wins with roll
      if (roll < target.tossMulti) {
        message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
        targetWon(message, user, target);
      }

      //User wins with roll
      if (roll >= target.tossMulti) {
        message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
        userWon(message, user, target);
      }
    }

    //Equal Multi Toss
    if (target.tossMulti === user.tossMulti) {
      const roll2 = Math.floor(Math.random() * 3);

      if (roll2 === 1) { //User wins
        message.channel.send(`${user} won the toss, type either \`batting\` or \`bowling\``);
        userWon(message, user, target);
      }

      if (roll2 === 2) { //Target wins
        message.channel.send(`${target} won the toss, type either \`batting\` or \`bowling\``);
        targetWon(message, user, target);
      }
    }
  }
};

async function start(message, batsman, bowler) {
  await message.channel.send(`${batsman} and ${bowler}, get to your dms to play!`);

  const firstInnings = require("../functions/innings1.js");
  
  await db.findOneAndUpdate( { _id: batsman.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  
  await db.findOneAndUpdate( { _id: bowler.id }, {
      $set: { status: true } },
      { new: true, upsert: true });
  
  firstInnings(batsman, bowler);
}

async function userWon(message, user, target) {
  const userCollector = message.channel.awaitMessages(
    m => m.author.id === user.id, { max: 1, time: 20000, errors: ['time'] }
  ).then( async msgs => {
    const m = msgs.first();
    if (m.content.toLowerCase().trim() === "batting") {
      batsman = user;
      bowler = target;
    }
    if (m.content.toLowerCase().trim() === "bowling") {
      batsman = target;
      bowler = user;
    } else {
      m.reply("Type either `batting` or `bowling`");
      return userWon(message, user, target);
    }
    await message.channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler);
  }).catch(e => { 
    if (e) message.channel.send('Time\'s up!');
  });
}

async function targetWon(message, user, target) {
  const targetCollector = message.channel.createMessageCollector(
    m => m.author.id === target.id, { max: 1, time: 20000, errors: ['time'] }
  ).then( async msgs => {
    const m = msgs.first();
    if (m.content.toLowerCase().trim() === "batting") {
      batsman = target;
      bowler = user;
      end(targetCollector);
    }
    if (m.content.toLowerCase().trim() === "bowling") {
      batsman = user;
      bowler = target;
      end(targetCollector);
    } else {
      m.reply("Type either `batting` or `bowling`");
      return targetWon(message, user, target);
    }
    await message.channel.send(`Batsman is ${batsman}, Bowler is ${bowler}`);
    start(message, batsman, bowler);
  }).catch(e => { //Timeout
    if (e) message.channel.send('Time\'s up!');
   });
}