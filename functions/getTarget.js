const db = require('../schemas/player.js');
const getErrors = require('./getErrors.js');

module.exports = async (message, args, client) => {
  let target;
  if(args.length > 0) {
    let query = args[0];
    let user = message.mentions.users.first() || 
    client.users.cache.get(query) || 
    client.users.cache.find(user => user.tag == query);
    if(!user || user.bot) {
      message.reply('Invalid Target, Either ping them, give their id or type their username#0000 without @');
      return;
    }
    target = await getData();
    async function getData () {
      const data = await db.findOne({_id: user.id});
      if(!data) {
        message.reply(getErrors({error: 'data', user}));
        return;
      } else {
        return user;
      }
    }
  } else {
    target = message.author;
  }
  return target;
}