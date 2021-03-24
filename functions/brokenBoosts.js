const db = require('../schemas/player.js');

module.exports = async function() {
  
  const brokeCoinBoosts = await db.find({ coinBoost : { $gte : Date.now() }});
  if(brokeCoinBoosts.length === 0) {
    console.log('No broken coin boosts');
    return;
  } else {
      for(const boost of brokeCoinBoosts) {
        const clearBoost = require('./clearBoost.js');
        clearBoost('coin', boost);
      }
    }
  
  
  const brokeTossBoosts = await db.find({ tossBoost : { $gte : Date.now() }});
  if(brokeTossBoosts.length === 0) {
    console.log(brokeTossBoosts + '\nNo broken toss boosts');
    return;
  } else {
      for(const boost of brokeTossBoosts) {
        const clearBoost = require('./clearBoost.js');
        clearBoost('toss', boost);
      }
    }
};