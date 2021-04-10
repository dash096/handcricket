const gain = require('../../functions/gainExp.js');
const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const updateCoins = require('../cricket/train.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'slots',
  aliases: ['luck', 'slot'],
  description: 'Test your luck! Hope you win but legends says you will never ever win.',
  category: 'Minigames',
  syntax: 'e.slots <amount>',
  status: true,
  cooldown: 60,
  run: async (message) => {
    const { content, channels, mentions, author } = message;
    const data = await db.findOne({_id: author.id});
    await db.findOneAndUpdate({_id: author.id}, { $set: { status: true } });
  }
};