const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function (what, amount, user, target, msg) {
  const args = msg.content.trim().split(' ');
  
  if(args.length == 4 && what === 'coins') {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const oldUserCC = userData.cc;
    const oldTargetCC = targetData.cc;
    
    if(oldUserCC < amount) {
      msg.reply('You dont have that many coins!');
      return;
    } else {
      //Update Db 
      await db.findOneAndUpdate({ _id: user.id }, { $set: {cc: oldUserCC - parseInt(amount)} });
      await db.findOneAndUpdate({ _id: target.id }, { $set: {cc: oldTargetCC + parseInt(amount)} });
      msg.reply("Successfully Traded " + `${await getEmoji} ${amount}` + " coins!");
    }
  }
  else {
    const itemName = what[0];
    
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    let userBag = userData.bag;
    let targetBag = targetData.bag;
    if(!userBag) {
      userBag = {};
    }
    if(!targetBag) {
      targetBag = {};
    }
    
    let oldUserAmount = userBag[itemName];
    let oldTargetAmount = targetBag[itemName];
    
    if(!oldUserAmount || oldUserAmount < amount) {
      return msg.reply('You dont have that many ' + itemName);
    }
    if(!oldTargetAmount) {
      oldTargetAmount = 0;
    }
    
    const newAmount = oldUserAmount - parseInt(amount);
    
    if(newAmount === 0) {
      delete userBag[itemName];
      targetBag[itemName] = oldTargetAmount + parseInt(amount);
    } else {
      userBag[itemName] = newAmount;
      targetBag[itemName] = oldTargetAmount + parseInt(amount);
    }
    
    await db.findOneAndUpdate({_id: user.id}, { $set: { bag: userBag } });
    await db.findOneAndUpdate({_id: target.id}, { $set: { bag: targetBag } });
    
    await msg.channel.send('Successfully traded ' + amount + ' ' + itemName + ' with' + ' **' + target.tag + '**' );
  }
};
