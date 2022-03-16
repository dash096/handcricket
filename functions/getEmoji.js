const client = require('../index.js');

let cache = {};

module.exports = async (name, decor) => {
  let generalEmojis = ['920880917566861332']
  let decorEmojis = ['953616925009784882']
  
  if(cache[name]) {
    return cache[name];
  }
  
  if (decor) {
    let decorEmoji;
    for(const guild of decorEmojis) {
      const emojiGuild = await client.guilds.fetch(guild);
      const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
      
      if(emoji) {
        cache[name] = emoji;
        decorEmoji = emoji;
      } else {
        decorEmoji = '';
      }
    }
    return decorEmoji;
  } else {
    const emojiGuild = await client.guilds.fetch(generalEmojis[0]);
    const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name) ||
      emojiGuild.emojis.cache.find(emoji => emoji.name == "anything");
    
    if(emoji) {
      cache[name] = emoji;
      return emoji;
    } else {
      return '';
    }
  }
}
