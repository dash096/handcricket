const db = require('../schemas/player.js');

module.exports = async (amount, data) => {
  const oldBal = data.cc;
  await db.findOneAndUpdate({_id: data._id}, { $set: {cc: parseInt(oldBal) + parseInt(amount)} });
};