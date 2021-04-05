const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function() {
  const datas = await db.find();
  
  let brokeQuests = [];
  let toFixQuests = [];
  
  for(const data of datas) {
    if(!data.time) {
      return;
    }
    else if(data.time.getTime() < Date.now()) {
      console.log(data.time + 'Past');
      brokeQuests.push(data);
    } else if(data.time.getTime() > Date.now()) {
      console.log(data.time + 'Future');
      toFixQuests.push(data);
    }
  }
  
  console.log(brokeQuests, toFixQuests);
  
  if(!brokeQuests || brokeQuests.length === 0) {
    console.log('No BrokeQuests Past now.');
  } else {
    for(const data of brokeQuests) {
      await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
    }
  }
  
  if(!toFixQuests || toFixQuests.length === 0) {
    console.log('No toFixQuests Future now.');
  } else {
    for(const data of toFixQuests) {
      const time = data.quests.time.getTime() - Date.now();
      console.log(time);
      setTimeout(async () => {
        await db.findOneAndUpdate({_id:data._id}, { $unset: {quests} });
      }, time);
    }
  }
};