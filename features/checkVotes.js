const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getDecors = require('../functions/getDecors.js');
const express = require('express')
const { Webhook } = require('@top-gg/sdk')
const app = express()

module.exports = async ({client, topggapi}) => {
  const voteWebhook = new Webhook(process.env.TOPGG_WEBHOOK_AUTH)
  
  app.post('/topgg',
    voteWebhook.listener(async (vote) => {
      let data = await db.findOne({ _id: vote.user.id });
      let user = await client.users.fetch(vote.user);
      let quests = data.quests || {};
      quests.support = true;
      await db.findOneAndUpdate({ _id: user.id }, {
        $set: {
          voteClaim: true,
          voteCooldown: (Date.now() + (12 * 60 * 60 * 1000)),
          voteStreak: ((data.voteStreak || 0) + 1),
          quests: quests,
          lastVoted: (Date.now()),
        }
      });
      setTimeout(async () => {
        let voteReminder = 'Your vote timer has refreshed, you can vote here: https://top.gg/bot/804346878027235398/vote\n  Join the community server for 2x Coin Boost, A Helmet and more!\nDo `e.invite` for the link'
        await db.findOneAndUpdate({ _id: user.id }, {
          $set: {
            voteClaim: false,
          },
          $unset: {
            voteCooldown: false,
          }
        });
        user.send(voteReminder);
      }, 60 * 60 * 12 * 1000);
      user.send(`Thanks for voting, You got ${await rewards(data, user)} for voting!`)
    })
  )
  
  app.get('/', (req, res) => {
    res.send('<h2> Hello World </h2>')
  });
  
  app.listen(process.env.PORT || 8080);
};

async function rewards(data, user) {
  let reward;
  let name;
  if (data.voteStreak < 10) {
    reward = 'coin';
    name = 'coin';
  } else if (data.voteStreak > 0 && data.voteStreak % 25 !== 0) {
    reward = 'lootbox';
    name = 'lootbox';
  } else {
    reward = 'decor';
    name = 'sh';
  }
  
  const bag = data.bag || {};
  const decors = data.decors || {};
  const decorsData = await getDecors();
  
  let newValue;
  if (reward == 'lootbox') {
    newValue = bag;
    newValue.lootbox = (bag.lootbox || 0) + 2;
  } else if (reward == 'decor') {
    let decor = decorsData[Math.floor(Math.random() * decorsData.length)];
    newValue = decors;
    newValue[decor] = (decors[decor] || 0) + 1;
  } else {
    reward = parseInt(Math.random() * 696);
    newValue = data.cc + (reward * 2);
  }
  
  if(parseInt(reward)) {
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        cc: newValue
      }
    });
  } else {
    await db.findOneAndUpdate({ _id: user.id }, {
      $set: {
        bag: newValue
      }
    });
  }
  return `${await getEmoji(name)} ${reward}`;
}