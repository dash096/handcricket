const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getDecors = require('../functions/getDecors.js');
const express = require('express')
const { Webhook } = require('@top-gg/sdk')

module.exports = async ({client, topggapi}) => {
  const wh = new Webhook(process.env.TOPGG_WEBHOOK_AUTH)
  const app = express()
  
  app.get('/', (req, res) => {
    res.send('<h2> Hello World </h2>')
  })
  
  app.post('/webhook', wh.listener(async (vote) => {
    (await client.users.fetch("772368021821718549")).send("VOTE", vote)
  }))
  
  app.listen(process.env.PORT || 8080);
};

async function rewards(data, user) {
  let reward;
  let name;
  if ((data.voteStreak) < 10) {
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
  const decorsData = await getDecors();
  
  let newValue;
  if (reward == 'lootbox') {
    newValue = bag;
    newValue.lootbox = (bag.lootbox || 0) + 2;
  } else if (reward == 'decor') {
    let decor = decorsData[Math.floor(Math.random() * decorsData.length)];
    newValue = bag;
    newValue.decors[decor] = (bag.decors[decor] || 0) + 1;
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
  return `2x ${await getEmoji(name)} ${reward}`;
}