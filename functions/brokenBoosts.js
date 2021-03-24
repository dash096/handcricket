const db = require('../schemas/player.js');

module.exports = async function() {
  const brokeCoinBoosts = await db.find({ coinBoost : { $gte : Date.now() }});
  console.log(brokeCoinBoosts);
    
  const brokeTossBoosts = await db.find({ tossBoost : { $gte : Date.now() }});
  console.log(brokeTossBoosts);
}