






const db = require('../schemas/player.js');

module.exports = async (user, amount) => {
  await db.findOneAndUpdate({ _id: user.id }, {
    $inc: {
      stamina: amount
    }
  });
  return;
}