const db = require('../schemas/player.js');
const emoji = require('../index.js');

module.exports = {
  name: 'balance',
  aliases: ['bal',
    'cash',
    'wallet'],
  description: 'Shows balance of a user.',
  category: 'handcricket',
  cooldown: '10s',
  run: async ({
    message
  }) => {
    const target = message.mentions.users.first() || message.author;

    const data = await db.findOne({
      _id: target.id
    }).catch((e) => {
      if (e) {
        message.reply(`${target.username} isnt a player. Do \`!start\` to start.`);
        return;
      }
      message.channel.send(`**${target.username}** has ${data.cc} coins.`);
    });

  }
}