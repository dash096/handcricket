const db = require('../../schemas/player.js');

module.exports = {
  name: 'quests',
  aliases: ['task', 'tasks', 'quest'],
  description: 'Your daily tasks and to keep you interested',
  category: 'Cricket',
  syntax: 'e.quests',
  run: async (message) => {
    const { channel, author, content } = message;
    
    const data = await db.findOne({_id: message.author.id});
    if(!data) return channel.send(`You are not a player, Do \`${prefix}start\``);
    
    console.log(data.quests);
  }
}