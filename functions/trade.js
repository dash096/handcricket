const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBag = require('./updateBag.js');

module.exports = async function (item, amount, user, target, msg) {
  const coinEmoji = await getEmoji('coin');
  
  const args = msg.content.trim().split(' ');
  
  if(args.length == 4 && item === 'coins') {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const oldUserCC = userData.cc;
    const oldTargetCC = targetData.cc;
    
    if(oldUserCC < amount) {
      let error = 'lessAssets';
      msg.reply(getErrors({error, user, itemName}));
      return;
    } else {
      //Update Db 
      await db.findOneAndUpdate({ _id: user.id }, { $set: {cc: oldUserCC - parseInt(amount)} });
      await db.findOneAndUpdate({ _id: target.id }, { $set: {cc: oldTargetCC + parseInt(amount)} });
      msg.reply("Successfully Traded " + `${coinEmoji} ${amount}` + " coins!");
    }
  }
  else {
    const itemName = item[0];
    
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    updateBag(itemName, parseInt(amount), userData, msg);
    updateBag(itemName, -(parseInt(amount)), targetData, msg);
    await msg.channel.send('Successfully traded ' + amount + ' ' + itemName + ' with' + ' **' + target.tag + '**' );
  }
};
