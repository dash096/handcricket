const db = require('../../schemas/player.js');

module.exports = {
  name: 'status',
  aliases: ['cs', 'fix'],
  description: 'Changes the status of the users mentioned',
  category: 'owner',
  syntax: 'e.status <user> <user>',
  run: async ({message}) => {
    const { channel, content, author, mentions } = message;
    
    if(author.id === '772368021821718549') {
      let victims = mentions.users;
      victims = victims.values();
      victims = Array.from(victims);
      
      if(!victims) {
        return;
      } else {
        for(const victim of victims) {
          const data = await db.findOne({_id: victim.id});
          if(!data) return;
          await db.findOneAndUpdate({_id: victim.id}, {$set: {status: false}});
          console.log(victim.tag + ' fixed');
        }
      }
      
    }
  }
}