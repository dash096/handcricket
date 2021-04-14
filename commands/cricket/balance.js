const db = require('../../schemas/player.js');
const getEmoji = require('../../index.js');
const gain = require('../../functions/gainExp.js');
const getTarget = require('../../functions/getTarget.js');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'cash', 'wallet'],
  description: 'Shows balance of a user.',
  category: 'Cricket',
  syntax: 'e.balance @user',
  cooldown: 5,
  run: async ({message, args, client}) => {
    const { content, author, channel, mentions } = message;
    const coinEmoji = await getEmoji('coin');
    
    let target = getTarget(message, args, client);
    if(!target) return;
    
    const data = await db.findOne({_id: target.id});
    
    message.channel.send(`**${target.tag}** has ${coinEmoji} ${data.cc} coins.`);
    await gain(data, 1, message);
  }
};