const db = require('../schemas/player.js');
const getErrors = require('./getErrors.js');

module.exports = (message, args, client) => {
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
    db.findOne({_id: user.id}).then((data) => {
      if(!data) {
        message.reply(getErrors({error: 'data', user}));
      } else {
        target = user;
      }
    });
    return target;
  } else {
    return message.author;
  }
}