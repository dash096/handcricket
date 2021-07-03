const ServerID = process.env.SERVERID
const unorganicServers = require('../functions/leaveUnorganic.js')

module.exports = async ({ client }) => {
  client.on('guildCreate', async (guild) => {
    await unorganicServers(client, guild)
  })
}