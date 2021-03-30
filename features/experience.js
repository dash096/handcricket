const db = require('../schemas/player.js');

module.exports = (client, instance) => {
  client.on('message', async (msg) => {
    const prefix = instance.getPrefix(msg.guild);
    if(msg.author.bot) return;
    
    if(msg.content.startsWith(prefix)) {
      if(msg.content.length > 7) {
        const data = await db.findOne({_id: msg.author.id});
        if(!data) return;
        
        const rando = Math.random();
        if(rando > 0.65) {
          const oldXP = data.xp;
          await db.findOneAndUpdate({_id: data._id}, { $set: {xp: oldXP + 0.1 } }, {new: true, upsert: true});
        }
      }
    }
  });
};

module.exports.config = {
  displayName: 'exp',
  dbName: 'xp',
  loadDBFirst: true
};
