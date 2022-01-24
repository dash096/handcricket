const db = require('../schemas/player.js');

module.exports = async ({ client }) => {
  setInterval( async function () {
    await db.updateMany({ stamina: { $lt: 10 }}, {
      $inc: {
        stamina: 1,
      }
    });
  },
    10 * 60 * 1000 //10 minutes
  );
}