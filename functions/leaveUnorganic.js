module.exports = async (client, guild) => {
  let bots = 0
  let humans = 0
  
  let members = (await guild.members.fetch()).map(m => m)
  let bots = 0
  let humans = 0
  for (let i = 0; i < members.length; i++) {
    if (members[i].user.bot) bots += 1
    else humans += 1
  }
  
  let left
  if (bots >= humans) {
    left = true
    await guild.owner.user.send('Seems like too many bots as compared to humans in the server, I left it...')
  } else if (bots > 75) {
    left = true
    await guild.owner.user.send('Oof, 50+ bots in your server, seems like a bot farm, I left it.')
  } else if (humans <= 2) {
    left = true
    await guild.owner.user.send('I left the server as it was detected private.')
  }
  if (left) {
    await guild.leave()
  }
  
  let user = await client.users.fetch(guild.ownerID)
  let os = await client.guilds.fetch(ServerID)
  let logChannel = os.channels.cache.find(c => c.name == 'dispo')
  logChannel.send([user.username || guild.ownerID, guild.members.cache.size, bots, humans, left ? 'left' : ''].join(', '))
}