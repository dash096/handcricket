const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

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
    const emoji = await getEmoji;
    const target = message.mentions.users.first() || message.author;

    const data = await db.findOne({
      _id: target.id
    }).catch((e) => {
      console.log(e)
    });
    
    if (!data) {
      message.reply(target.tag + " is not a player. Do `!start`");
      return;
    }
    message.channel.send(`**${target.username}** has ${emoji} ${data.cc} coins.`);

  }
}