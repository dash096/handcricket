const db = require('../../schemas/player.js');

module.exports = {
  name: 'notifs',
  aliases: ['notifications', 'dm', 'silence', 'shh'],
  description: 'Toggle your dm notifications on updates and stuffs',
  category: 'General',
  syntax: 'e.notifs',
  cooldown: 15,
  run: async ({message, args}) => {
    const { author, content } = message;
    const data = await db.findOne({ _id: author.id });
    const notifs = data.notifs;
      
    let toggle;
    if (notifs === false) toggle = true;
    else if(notifs === true) toggle = false;
      
    try {
      await db.findOneAndUpdate( { _id: author.id }, { $set: { notifs: toggle } } );
      message.reply(`DM notifs set to ${toggle}`);
    } catch (e) {
      console.log(e);
    }
  }
};