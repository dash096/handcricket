const ServerID = process.env.SERVERID

module.exports = async ({ client }) => {
  client.on('guildCreate',async (guild) => {
    let mems = guild.members.cache.map(m => m.user.bot)
    
    let bots = 0
    let humans = 0
    mems.forEach(mem => {
      if (mem === true) bots += 1
      else humans += 1
    })
    
    let user = await client.users.fetch(guild.ownerID)
    let os = await client.guilds.fetch(ServerID)
    let logChannel = os.channels.cache.find(c => c.name == 'dispo')
    logChannel.send([user.username || guild.ownerID, bots, humans].join(', '))
  })
}