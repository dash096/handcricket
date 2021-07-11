const db = require('../schemas/player.js');
const getErrors = require('./getErrors.js');

module.exports = async (message, args, client) => {
  let target;
 
  if(args.length > 0) {
    let query = args[0];
    let member = message.mentions.members.first() || 
               message.guild.members.cache.find(
                 m => m.user.id == query || m.displayName == query
               );
    
    if(!member || member.user.bot) {
      member = message.author
    } 
    
    const data = await db.findOne({ _id: member.user.id });
    if(!data) {
      message.reply(getErrors({ error: 'data', user: member.user }));
      return;
    } else {
      target = member;
    }
  } else {
    target = message.member;
  }
  
  let { displayName } = target
  target = target.user
  target.displayName = displayName
  
  return target;
}