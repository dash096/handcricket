const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const gain = require('../functions/gainExp.js');

module.exports = {
  name: 'balance',
  aliases: ['bal',
    'cash',
    'wallet'],
  description: 'Shows balance of a user.',
  category: 'handcricket',
  cooldown: '10s',
  run: async ({message, args, text, client, prefix}) => {
    const emoji = (await getEmoji)[0];
    
    const target = message.mentions.users.first() || message.author;
    const data = await db.findOne({_id: target.id});
    if (!data) return message.reply(target.tag + " is not a player. Do `" + prefix + "start`");
    
    message.channel.send(`**${target.username}** has ${emoji} ${data.cc} coins.`);
    await gain(data, 0.3);
  }
};