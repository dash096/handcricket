const db = require('../schemas/player.js');
const getEmoji = require('../index.js');

module.exports = async function() {
  const datas = await db.find();
  
  let brokeQuests = [];
  let toFixQuests = [];
  
  for(const data of datas) {
    if(data.time.getTime() < Date.now()) {
      console.log(data.time + 'Past');
      brokeQuests.push(data);
    } else if(data.time.getTime() > Date.now()) {
      console.log(data.time + 'Future');
      toFixQuests.push(data);
    }
  }
  
  if(!brokeQuests || brokeQuests.length === 0) {
    console.log('No BrokeQuests Past now.');
  } else {
    for(const data of brokeQuests) {
      await db.findOneAndUpdate({_id:data._id}, { $unset: {data.quests} });
    }
  }
  
  if(!toFixQuests || toFixQuests.length === 0) {
    console.log('No toFixQuests Future now.');
  } else {
    for(const data of toFixQuests) {
      const time = data.quests.time.getTime() - Date.now();
      console.log(time);
      setTimeout(() => {
        await db.findOneAndUpdate({_id:data._id}, { $unset: {data.quests} });
      }, time);
    }
  }
};