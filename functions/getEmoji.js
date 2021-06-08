const client = require('../index.js');

module.exports = async (name, decor) => {
  let generalEmojis = '828269371699888178';
  
  const emojiGuild = await client.guilds.fetch(generalEmojis);
  const emoji = emojiGuild.emojis.cache.find(emoji => emoji.name == name);
  return emoji;
}