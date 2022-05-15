const db = require('../schemas/player.js');

module.exports = ({client, prefix}) => {
  client.on('message', async (msg) => {
    if(
      !msg.content.startsWith(prefix) ||
      msg.author.bot
    ) return;
    
    if(Math.random() > 0.5) {
      await db.findOneAndUpdate(
        {_id: msg.author.id},
        { $inc: { xp: 0.1 } },
        {new: true, upsert: true}
      );
    }
  });
};