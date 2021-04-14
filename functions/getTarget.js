module.exports = (message, args, client) => {
  let target;
  if(args.length > 0) {
    let query = args[0].toLowerCase();
    target = message.mentions.users.first() || 
    client.users.cache.get(query) || 
    client.users.cache.find(user => user.tag.toLowerCase().startsWith(query)) ||
    (message.guild.members.cache.find(member => member.displayName.toLowerCase().startsWith(query))).user;
    if(!target || target.bot) {
      message.reply('Invalid user. Nice Try.');
      return;
    }
    return target;
  } else {
    return message.author;
  }
}