const db = require('../schemas/player.js');
const getErrors = require('./getErrors.js');

module.exports = async (message, args, client) => {
  let target;
 
  if(args.length > 0) {
    let query = args[0];
    let user = message.mentions.members.first() || 
    message.guild.members.cache.get(query) || 
    message.guild.members.cache.find(user => user.displayName == query);
    if(!user || user.bot) {
      message.reply('Invalid Target, ping or give their ID.');
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
    target = message.member;
  }
  return target;
}