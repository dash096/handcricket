const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function() {
  
  //Get both Lesser and Greater Boosts.
  const brokeCoinBoosts = [];
  //Push broke boosts
  await getBrokenCoinBoosts();
  
  //If no boosts return;
  if(brokeCoinBoosts.length === 0) {
    console.log('No broken coin boosts');
  } else {
    //Clear Boosts
    for(const boost of brokeCoinBoosts) {
      const clearBoost = require('./clearBoost.js');
      clearBoost('coin', boost);
      console.log(boost._id + ' - broken Coin Boost found!')
    }
  }
  
  
  //Get both Lesser and Greater Boosts.
  const brokeTossBoosts = [];
  //Push Broke Boosts
  await getBrokenTossBoosts();
  
  //If no boosts return.
  if(brokeTossBoosts.length === 0) {
    console.log('No broken toss boosts');
  } else {
    //Clear Boosts
    for(const boost of brokeTossBoosts) {
      const clearBoost = require('./clearBoost.js');
      clearBoost('toss', boost);
      console.log(boost._id + ' - broken toss boost found!')
    }
  }
  
  
  
  if(brokeTossBoosts.length === 0 && brokeCoinBoosts.length === 0) {
    return console.log('No broken boosts.');
  }
  
  
  
  
  async function getBrokenTossBoosts() {
    const lte = await db.find({ tossBoost : { $lte : Date.now() } });
    const gte = await db.find({ tossBoost : { $gte : Date.now() } });
    for(const a of lte) {
      brokeTossBoosts.push(a);
    }
    for(const a of gte) {
      brokeTossBoosts.push(a);
    }
  }
  
  
  async function getBrokenCoinBoosts() {
    const lte = await db.find({ coinBoost : { $lte : Date.now() } });
    const gte = await db.find({ coinBoost : { $gte : Date.now() } });
    for(const a of lte) {
      brokeCoinBoosts.push(a);
    }
    for(const a of gte) {
      brokeCoinBoosts.push(a);
    }
  }
};