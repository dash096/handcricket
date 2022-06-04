const client = require('../index.js');

let cache = {};

module.exports = async (name, decor, uno) => {
  let generalEmojis = ['920880917566861332']
  let decorEmojis = ['953616925009784882']
  let unoEmojis = ['980684246605758514', '981395381625704468']
  
  if(cache[name]) return cache[name]
  
  let guilds = decor
    ? decorEmojis
    : uno
    ? unoEmojis
    : generalEmojis
  
  let emoji
  
  for (let id of guilds) {
    let guild = await client.guilds.fetch(id)
    
    emoji = guild.emojis.cache.find(e => e.name === name)
    
    if (emoji) {
      cache[name] = emoji
      break
    }
  }
  
  return emoji || ""
}
