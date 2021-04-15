module.exports = (message, args, client) => {
  let target;
  if(args.length > 0) {
    let query = args[0];
    target = message.mentions.users.first() || 
    client.users.cache.get(query) || 
    client.users.cache.find(user => user.tag == query);
    if(!target || target.bot) {
      message.reply('**Invalid Target**, Either ping them, give their id or type their username#0000 without @');
      return;
    }
    return target;
  } else {
    return message.author;
  }
}