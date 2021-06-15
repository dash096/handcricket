const db = require('../schemas/player.js');

module.exports = async (user, amount) => {
  const data = await db.findOne({ _id: user.id });
  if (!data._id) return;
  
  let newAmount = data.stamina + amount;
  if (newAmount > 10) newAmount = 10;
  
  await db.findOneAndUpdate({ _id: data._id }, {
    $set: {
      stamina: (data.stamina + amount)
    }
  });
  return;
}