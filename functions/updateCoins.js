const db = require('../schemas/player.js');

module.exports = async (amount, data) => {
  await db.findOneAndUpdate({ _id: data._id }, {
    $inc: {
      cc: parseInt(amount)
    }
  });
};