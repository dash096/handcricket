const db = require('../schemas/player.js');

module.exports = async ({client}) => {
  await db.updateMany({
    status: true
  }, {
    $set: {
      status: false
    }
  })
};