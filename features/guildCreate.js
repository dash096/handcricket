const ServerID = process.env.SERVERID
const leaveUnorganic = require('../functions/leaveUnorganic.js')

module.exports = async ({ client }) => {
  client.on('guildCreate', async (guild) => {
    await leaveUnorganic(client, guild)
  })
}