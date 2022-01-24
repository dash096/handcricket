const client = require('../index.js');

let cache = {};

module.exports = async (/*name, decor*/) => {
  let generalEmojis = ['934448757754437663']
  //let decorEmojis = ['851717056575176735']
  
  let name = "anything"
  let decor = false
  
  if(cache[name]) {
    return cache[name];
  }
  
  if (decor) {
    return ''
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
    const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
    
    if(emoji) {
      cache[name] = emoji;
      return emoji;
    } else {
      return '';
    }
  }
}