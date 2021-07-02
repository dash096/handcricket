moule.exports = async ({ client }) => {
  client.on('guildCreate',async (guild) => {
    let user = await client.users.fetch(guild.ownerID)
    console.log(user.username || guild.ownerID)
  })
}