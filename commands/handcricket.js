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
    //Opponent Validation
    if (!target || target.bot || target.id === user.id) {
      message.reply("Invalid opponent, `!handcricket <@user>`");
      return;
    }
    //Database
    const userdata = await db
    .findOne({
      _id: user.id
    })
    .catch(e => {
      console.log(e);
    });
    const targetdata = await db
    .findOne({
      _id: target.id
    })
    .catch(e => {
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
    const will = await checkWill(message, target); //Returns true or false
    if (will == true) {
      choosePlayers();
    }
    async function choosePlayers() {
      //Toss
      const roll = Math.floor(Math.random());
      let batsman;
      let bowler;
      //User High Toss
      if (user.tossMulti > target.tossMulti) {
        //Roll supports User
        if (roll < user.tossMulti) {
          message.channel.send(
            `$ {user} won the toss, type either\` batting\` or\` bowling\``
          );
          //userCollector
          const userCollector = message.channel.createMessageCollector(
            m => m.author.id === user.id,
            {
              time: 20000
            }
          );
          //userCollection
          userCollector.on("collect", async m => {
            if (m.content.toLowerCase().trim() === "batting") {
              batsman = user;
              bowler = target;
              end(userCollector);
            }
            if (m.content.toLowerCase().trim() === "bowling") {
              batsman = target;
              bowler = user;
              end(userCollector);
            } else {
              m.reply("Type either `batting` or `bowling`");
              return;
            }
            await message.channel.send(
              `Batsman is ${batsman}, Bowler is ${bowler}`
            );
            start(message, batsman, bowler);
          });
        }
        //roll supports target
        if (roll >= user.tossMulti) {
          //targetCollector
          const targetCollector = message.channel.createMessageCollector(
            m => m.author.id === target.id,
            {
              time: 20000
            }
          );
          message.channel.send(`$ {
            target
            }
            won the toss, type either\` batting\` or\` bowling\``);
          //targetCollection
          targetCollector.on("collect", async m => {
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
              return;
            }
            await message.channel.send(
              `Batsman is ${batsman}, Bowler is ${bowler}`
            );
            start(message, batsman, bowler);
          });
        }
      }
      //Target High Toss
      if (user.tossMulti < target.tossMulti) {
        //Roll supports User
        if (roll < target.tossMulti) {
          message.channel.send(
            `${target} won the toss, type either\` batting\` or\` bowling\``
          );
          //targetCollector
          const targetCollector = message.channel.createMessageCollector(
            m => m.author.id === target.id,
            {
              time: 20000
            }
          );
          //userCollection
          targetCollector.on("collect", async m => {
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
              return;
            }
            await message.channel.send(
              `Batsman is ${batsman}, bowler is ${bowler}`
            );
            start(message, batsman, bowler);
          });
        }
        //roll supports target
        if (roll >= target.tossMulti) {
          //userCollector
          const userCollector = message.channel.createMessageCollector(
            m => m.author.id === user.id,
            {
              time: 20000
            }
          );
          message.channel.send(
            `$ {user} won the toss, type either\` batting\` or\` bowling\``
          );
          //targetCollection
          userCollector.on("collect", async m => {
            if (m.content.toLowerCase().trim() === "batting") {
              batsman = user;
              bowler = target;
              end(userCollector);
            }
            if (m.content.toLowerCase().trim() === "bowling") {
              batsman = target;
              bowler = user;
              end(userCollector);
            } else {
              m.reply("Type either `batting` or `bowling`");
              return;
            }
            await message.channel.send(
              `Batsman is ${batsman} , Bowler is ${bowler}`
            );
            start(message, batsman, bowler);
          });
        }
      }
      //Equal Multi Toss
      if (target.tossMulti === user.tossMulti) {
        const roll2 = Math.floor(Math.random() * 3);
        if (roll2 === 1) {
          //userCollector
          const userCollector = message.channel.createMessageCollector(
            m => m.author.id === user.id
          );
          message.channel.send(
            `$ {user} won the toss, type either\` batting\` or\` bowling\``
          );
          //Collection
          userCollector.on("collect", async m => {
            if (m.content.trim().toLowerCase() === "batting") {
              batsman = user;
              bowler = target;
              end(userCollector);
            } else if (m.content.trim().toLowerCase() === "bowling") {
              batsman = target;
              bowler = user;
              end(userCollector);
            } else {
              m.reply("Type either `batting` or `bowling`");
              return;
            }
            await message.channel.send(
              `Batsman is ${batsman}, Bowler is ${bowler}`
            );
            start(message, batsman, bowler);
          });
        }
        if (roll2 === 2) {
          //Collector
          const targetCollector = message.channel.createMessageCollector(
            m => m.author.id === target.id,
            {
              time: 20000
            }
          );
          message.channel.send(
            `${target} won the toss, type either\` batting\` or\` bowling\``
          );
          //Collection
          targetCollector.on("collect", async m => {
            if (m.content.trim().toLowerCase() === "batting") {
              batsman = target;
              bowler = user;
              end(targetCollector);
            } else if (m.content.trim().toLowerCase() === "bowling") {
              batsman = user;
              bowler = target;
              end(targetCollector);
            } else {
              m.reply("Type either `batting` or `bowling`");
              return;
            }
            await message.reply(`Batsman is ${batsman}, Bowler is ${bowler}`);
            start(message, batsman, bowler);
          });
        }
      }
    }
  }
};

function end(collector) {
  collector.stop();
}

async function start(message, batsman, bowler) {
  await message.channel.send(`$ {
    batsman
    }
    and $ {
    bowler
    }, get to your dms to play!`);
  const firstInnings = require("../functions/innings1.js");
  await db.findOneAndUpdate(
    {
      _id: batsman.id
    },
    {
      $set: {
        status: true
      }
    },
    {
      new: true,
      upsert: true
    }
  );
  await db.findOneAndUpdate(
    {
      _id: bowler.id
    },
    {
      $set: {
        status: true
      }
    },
    {
      new: true,
      upsert: true
    }
  );
  firstInnings(batsman,
    bowler);
}

async function checkWill(message, target) {
  await message.channel.send(`$ {target}, so do you want to play with $ {
    user
    } ? Say\` y\` / \`n\``);
  message.channel
  .awaitMessages(response => response.author.id === target.id,
    {
      max: 1,
      time: 30000,
      errors: ["time"]
    })
  .then(async collected => {
    const c = collected.first().content.toLowerCase();
    if (c == "y" || c == "yes") {
      collected.first().reply("Ok");
      return true;
    } else {
      collected.first().reply("Match aborted.");
      return false;
    }
  });
}