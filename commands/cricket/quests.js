const db = require('../../schemas/player.js');

module.exports = {
  name: 'quests',
  aliases: ['task', 'tasks', 'quest'],
  description: 'Your daily tasks and to keep you interested',
  category: 'Cricket',
  syntax: 'e.quests',
  run: async (message) => {
    const data = await db.findOne({_id: message.author.id});
    console.log(data.quests);
  }
}