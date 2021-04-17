const db = require('../schemas/player.js');

module.exports = async (name, amount, data, message) => {
  const userDecors = data.decors || {};
  const oldBal = userDecors[name] || 0;
  const newBal = oldBal + 1;
  
  userDecors[name] = newBal;
  
  await db.findOneAndUpdate({_id: data._id}, {$set: { decors: userDecors }}, {new: true, upsert: true});
};