const db = require('../schemas/player.js');

module.exports = async function() {
  
  const brokeCoinBoosts = await db.find({ coinBoost : { $gte : Date.now() }});
  if(brokeCoinBoosts.length === 0) {
    console.log('No broken coin boosts');
  }
    
  const brokeTossBoosts = await db.find({ tossBoost : { $gte : Date.now() }});
  if(brokeTossBoosts.length === 0) {
    console.log('No broken toss boosts');
  }
}