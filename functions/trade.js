const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBag = require('./updateBag.js');

module.exports = async function (itemName, itemAmount, user, target, msg) {
  const coinEmoji = await getEmoji('coin');
  
  const args = msg.content.trim().split(' ');
  
  if(args.length == 4 && itemName === 'coins') {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const oldUserCC = userData.cc;
    const oldTargetCC = targetData.cc;
    
    if(oldUserCC < itemAmount) {
      let error = 'lessAssets';
      msg.reply(getErrors({error, user, itemName}));
      return;
    } else {
      //Update Db 
      await db.findOneAndUpdate({ _id: user.id }, { $set: {cc: oldUserCC - parseInt(amount)} });
      await db.findOneAndUpdate({ _id: target.id }, { $set: {cc: oldTargetCC + parseInt(amount)} });
      msg.reply("Successfully Traded " + `${coinEmoji} ${itemAmount}` + " coins!");
    }
  }
  else {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    let e1 = await updateBag(itemName, parseInt(itemAmount), userData, msg);
    updateBag(itemName, -(parseInt(itemAmount)), targetData, msg);
    if(e1 != 'err') await msg.channel.send('Successfully traded ' + itemAmount + ' ' + itemName + ' with' + ' **' + target.tag + '**' );
  }
};
