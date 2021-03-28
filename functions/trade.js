const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function (what, amount, user, target, msg) {
  if(what === 'coins') {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const oldUserCC = userData.cc;
    const oldTargetCC = targetData.cc;
    
    if(oldUserCC < amount) {
      msg.reply('You dont have that many coins!');
      return;
    } else {
      //Update Db 
      await db.findOneAndUpdate({ _id: user.id }, { $set: {cc: oldUserCC - amount} });
      await db.findOneAndUpdate({ _id: target.id }, { $set: {cc: oldTargetCC + amount} });
      msg.reply("Successfully Traded " + `${await getEmoji} ${amount}` + " coins!");
    }
  }
  else {
    //later
  }
};