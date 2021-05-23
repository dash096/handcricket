const db = require('../schemas/player.js');
const getEmoji = require('../index.js');
const getErrors = require('./getErrors.js');
const updateBag = require('./updateBag.js');
const updateCoins = require('./updateCoins.js');

module.exports = async function (itemName, itemAmount, user, target, msg) {
  const coinEmoji = await getEmoji('coin');
  
  const args = msg.content.trim().split(' ');
  
  if(itemName == 'coins') {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    const oldUserCC = userData.cc;
    const oldTargetCC = targetData.cc;
    
    if(oldUserCC < itemAmount) {
      let error = 'lessAssets';
      msg.reply(getErrors({ error, user, itemName }));
      return;
    } else {
      updateCoins(-(parseInt(itemAmount)), userData);
      updateCoins(parseInt(itemAmount), targetData);
      msg.reply(`Successfully Traded ${coinEmoji} ${itemAmount} coins!`);
      if(targetData.notifs) await target.send(`**${user.username}** sent you ${coinEmoji} ${itemAmount} coins.`);
    }
  } else {
    const userData = await db.findOne({_id: user.id});
    const targetData = await db.findOne({_id: target.id});
    
    let e1 = await updateBag(itemName, parseInt(itemAmount), userData, msg);
    updateBag(itemName, -(parseInt(itemAmount)), targetData, msg);
    if(e1 != 'err') {
      await msg.reply(`Successfully traded ${itemAmount} ${itemName} with **${target.username}**`);
      if(targetData.notifs) await target.send(`**${user.username}** sent you ${itemAmount} ${itemName}.`);
    }
  }
};
