const client = require('../index.js');

let cache = {};

module.exports = async (name, decor) => {
  let generalEmojis = '828269371699888178';
  let decorEmojis = ['851717056575176735'];
  
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
    const emojiGuild = await client.guilds.fetch(generalEmojis);
    const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
    
    if(emoji) {
      cache[name] = emoji;
      return emoji;
    } else {
      return '';
    }
  }
}