const db = require('../schemas/player.js');

module.exports = async function() {
  
  const brokeCoinBoosts = await db.find({ coinBoost : { $gte : Date.now() }});
  if(brokeCoinBoosts.length === 0) {
    console.log('No broken coin boosts');
    return;
  } else {
      for(const brokeCoinBoost of brokeCoinBoosts) {
        const oldCoinMulti = brokeCoinBoost.coinMulti;
        const time = brokeCoinBoost.coinBoost.getTime() - Date.now();
        console.log(time/1000);
      
        setTimeout( async function clearBoost() {
          await db.findOneAndUpdate( {_id: brokeCoinBoost._id},
            { $set: { 
              coinMulti: oldCoinMulti/2,
              coinBoost: undefined,
              }
            }
          );
        }, time);
      }
    }
  
  
  const brokeTossBoosts = await db.find({ tossBoost : { $gte : Date.now() }});
  if(brokeTossBoosts.length === 0) {
    console.log('No broken toss boosts');
    return;
  } else {
      for(const brokeTossBoost of brokeTossBoosts) {
        const oldTossMulti = brokeTossBoost.TossMulti;
        const time = brokeTossBoost.tossBoost.getTime() - Date.now();
        console.log(time/1000);
      
        setTimeout( async function clearBoost() {
          await db.findOneAndUpdate( {_id: brokeTossBoost._id},
            { $set: { 
              tossMulti: oldTossMulti/2,
              tossBoost: undefined,
              }
            }
          );
        }, time);
      }
    }
}