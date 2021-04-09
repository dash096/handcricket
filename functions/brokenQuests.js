const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function() {
  const datas = await db.find();
  
  let brokeQuests = [];
  let toFixQuests = [];
  
  
  for(const data of datas) {
    quests = data.quests || {};
    if(quests.time) {
      if(quests.time.getTime() < Date.now()) {
        brokeQuests.push(data);
      } else if(quests.time.getTime() > Date.now()) {
        toFixQuests.push(data);
      }
    }
  }
  
  if(!brokeQuests || brokeQuests.length === 0) {
    console.log('0 BrokeQuests found.');
  } else {
    console.log(`${brokeQuests.length} brokenQuests found`);
    for(const data of brokeQuests) {
      await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
    }
  }
  
  if(!toFixQuests || toFixQuests.length === 0) {
    console.log('0 toFixQuests found.');
  } else {
    console.log(`${toFixQuests.length} toFixQuests found`);
    for(const data of toFixQuests) {
      const quests = data.quests;
      const time = quests.time.getTime() - Date.now();
      setTimeout( async () => {
        await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
      }, time);
    }
  }
};