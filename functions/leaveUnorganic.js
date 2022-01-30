const serverId = process.env.SERVER
const ownerId = process.env.OWNER

module.exports = async (client, guild) => {
  if (guild.ownerId === ownerId) return
  
  let bots = 0
  let humans = 0
  
  let members = (await guild.members.fetch()).map(m => m)
  
  for (let i = 0; i < members.length; i++) {
    if (members[i].user.bot) bots += 1
    else humans += 1
  }
  
  /*let left
  if (bots >= humans) {
    left = true
    await guild.owner.user.send(`Seems like too many bots as compared to humans in **${guild.name}**, I left it...`)
  } else if (bots > 75) {
    left = true
    await guild.owner.user.send(`50+ bots in **${guild.name}** server, seems like a bot farm, I left it.`)
  } else if (humans <= 2) {
    left = true
    await guild.owner.user.send(`**${guild.name}** was detected private. I left it.`)
  }
  if (guild.owner.user.id?
  ownerId && left) {
  ownerId && left) {
    await guild.leave()
  }*/
  
  let owner = await client.users.fetch(ownerId)
  owner.send(`Left ${JSON.stringify(guild)}`)
}