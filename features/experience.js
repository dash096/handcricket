const db = require('../schemas/player.js');

module.exports = (client, instance) => {
  client.on('message', async (msg) => {
    const prefix = instance.getPrefix(msg.guild.id);
    
    if(msg.content.startsWith(prefix)) {
      
      if(msg.content.length > 10) {
        const data = await db.findOne({_id: msg.author.id});
        
        if(!data) return;
        
        const rando = Math.random();
        
        if(rando > 0.65) {
          const oldXP = data.xp;
          await db.findOneAndUpdate({_id: data._id}, { $set: {xp: oldXP + 1 } }, {new: true, upsert: true});
        }
        
      }
      
    }
    
  });
};