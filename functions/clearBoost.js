

module.exports = async function (what, boost) {

  if(what === 'toss') {
    const oldTossMulti = boost.TossMulti;
  
    const time = boost.tossBoost.getTime() - Date.now();
    console.log(time/1000);
      
    setTimeout( async function clearBoost() {
      await db.findOneAndUpdate( {_id: boost._id},
        { $set: { 
            tossMulti: oldTossMulti/2,
            tossBoost: undefined,
          }
        }
      );
    }, time);
  }
  
  if(what === 'coin') {
    const oldCoinMulti = boost.coinMulti;
    
    const time = boost.coinBoost.getTime() - Date.now();
    console.log(time/1000);
      
    setTimeout( async function clearBoost() {
      await db.findOneAndUpdate( {_id: boost._id},
        { $set: { 
              coinMulti: oldCoinMulti/2,
              coinBoost: undefined,
          }
        }
      );
    }, time);
  }
  
};