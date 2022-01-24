const db = require('../schemas/player.js');

module.exports = async ({client}) => {
  const datas = await db.find({ status: true} );
  if(datas.length === 0) {
    console.log('0 brokeStatus found');
  }
  else {
    console.log(`${datas.length} brokestatus found`);
    for(const data of datas) {
      await db.findOneAndUpdate({_id: data._id}, {$set: {status: false}});
    }
  }
};