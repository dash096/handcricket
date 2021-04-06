const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function() {
  const datas = await db.find();
  
  let brokeQuests = [];
  let toFixQuests = [];
  
  
  for(const data of datas) {
    quests = data.quests;
    if(quests.time) {
      if(quests.time.getTime() < Date.now()) {
        console.log(data.time.getTime() + ' Past');
        brokeQuests.push(data);
      } else if(quests.time.getTime() > Date.now()) {
        console.log(quests.time.getTime() + ' Future');
        toFixQuests.push(data);
      }
    }
  }
  
  if(!brokeQuests || brokeQuests.length === 0) {
    console.log('No BrokeQuests Past now.');
  } else {
    console.log(`${brokeQuests.length} past broken quests found`);
    for(const data of brokeQuests) {
      await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
    }
  }
  
  if(!toFixQuests || toFixQuests.length === 0) {
    console.log('No toFixQuests Future now.');
  } else {
    console.log(`${toFixQuests.length} future broken quests found`);
    for(const data of toFixQuests) {
      const quests = data.quests;
      const time = quests.time.getTime() - Date.now();
      setTimeout( async () => {
        await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
      }, time);
    }
  }
};