










const db = require("../schemas/player.js")
const Discord = require("discord.js")
const getEmoji = require("./getEmoji.js")
const getErrors = require("./getErrors.js")
const embedColor = require("./getEmbedColor.js")

module.exports = async (message, gameName, min) => {
  const {channel, author} = message
  
  const enterEmoji = await getEmoji("enter")
  
  let players = []
  let error = null
  
  const collectEmbed = new Discord.MessageEmbed()
    .setTitle(`Join ${gameName} Match`)
    .setDescription(`React ${enterEmoji} to join.`)
    .setFooter(`By ${author}`)
    .setColor(embedColor)
  
  const collectMessage = await channel.send(collectEmbed)
  
  await collectMessage.react(enterEmoji);
  await collectMessage.react('❌');

  const collector = collectMessage.createReactionCollector((
      { emoji },
      { bot }
    ) => (
      (emoji.name === "enter" || emoji.name === "❌") && 
      !bot
    ), {
    time: 40000,
    dispose: true
  })
  
  collector.on("collect", async ({emoji}, user)=>{
    if (emoji.name === "❌" ) {
      if (user.id === author.id) {
        error = "Match Aborted"
        await collector.stop()
      }
      return
    }
    
    const data = await db.findOne({_id: user.id})
    
    if (!data) {
      await channel.send(getErrors({error:"data", user}))
      await collectMessage.reactions.cache.find(r => r.emoji.name === "enter").users.remove(user.id)
    } else if (data.status) {
      await channel.send(getErrors({error:"engaged", user}))
      await collectMessage.reactions.cache.find(r => r.emoji.name === "enter").users.remove(user.id)
    } else {
      await channel.send(`**${user.username}** joined!`)
      await changeStatus([user], true)
    }
  })
  
  collector.on("remove", async (reaction, user)=>{
    await channel.send(`**${user.username}** left.`)
    await changeStatus([user], false)
  })
  
  collector.on("end", async (reactions) => {
    if (error) return
    
    reactions.forEach(r => {
      if (r.emoji.name === "enter") {
        players = Array.from(r.users.cache.values()).filter(u => !u.bot)
      }
    })
    
    if (players.length < min) {
      await changeStatus(players, false)
      error = "Insufficient Players. Minimum required are 2."
      return
    }
  })
  
  async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
  
  while (1) {
    await sleep(5000)
    if (collector.ended) {
      if (error) throw error
      else return players
      break
    }
  }
}

async function changeStatus(users, boolean) {
  if (typeof boolean !== "boolean") return
  
  users.forEach(async ({id}) => {
    await db.findOneAndUpdate(
      {_id:id},
      {$set:{status:boolean}}
    )
  })
}