const serverID = require('./getTips.js');

module.exports = (message) => {
  const tips = [
  'Use e.equip <decor_name> to decorate your character',
  'You can decorate your profile with decorations',
  'You can check someone\'s balance or profile without pinging, Tyoe "@user#0000" and remove the "@"',
  'Decors can only be got in slots and lootboxes',
  'You can use powerups during a match. Do `e.shop` to check them',
  'Get a helmet for your character by joining the Community server(e.invite) + 2x Coin Boost + 2x Slots Boost',
  'Poor? Join the Community server(e.invite) for 2x Coin Boost and helmet decor and slots boost',
  'Want to challenge? Tournaments are held in the Community Server!',
  ]; //Last three Guild, Total index 8 
  const tip = () => {
    /*if(message.guild.id !== serverID) {
      return tips[Math.floor(Math.random() * 9)]
    }*/
    return tips[Math.floor(Math.random() * 6)]
  }
  return `\n\n**Tip:** ${tip()}`;
}