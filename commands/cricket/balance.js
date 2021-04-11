const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const gain = require('../../functions/gainExp.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'cash', 'wallet'],
  description: 'Shows balance of a user.',
  category: 'Cricket',
  syntax: 'e.balance @user',
  cooldown: 5,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    const coinEmoji = await getEmoji('coin');
    
    const target = mentions.users.first() || author;
    
    const data = await db.findOne({_id: target.id});
    
    message.channel.send(`**${target.username}** has ${coinEmoji} ${data.cc} coins.`);
    await gain(data, 1, message);
  }
};