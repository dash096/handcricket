const db = require('../schemas/player.js');

module.exports = async function (a, amount) {
  const oldxp = a.xp;
  const add = Math.random() * amount;
  await a.findOneAndUpdate({_id: a.id},
    {
      $set: {
        xp: oldxp + add
      }
    }
  );
};