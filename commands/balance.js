const db = require('../schemas/player.js');

module.exports = {
  name: 'balance',
  aliases: ['bal',
    'cash',
    'wallet'],
  description: 'Shows balance of a user.',
  category: 'handcricket',
  cooldown: '15s',
  run: async ({
    message
  }) => {
    const target = message.mentions.members.first() || message.author;

    const data = await db.findOne({
      _id: target.id
    });

    message.channel.send(`**${target.username}** has ${data.coins} coins.`);
  }
}