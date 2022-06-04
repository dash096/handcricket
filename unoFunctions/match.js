//absolute: ./unoFunctions/match.js
const Discord = require("discord.js")
const collectUsers = require("../functions/collectUsers.js")
const getEmoji = require("../functions/getEmoji.js")
const embedColor = require("../functions/getEmbedColor")

module.exports = async ({ message, client, args, prefix }) => {
  const {channel, author} = message
  
  const sTime = Date.now()
  
  try {
    var ps = await collectUsers(message, "UNO", 2)
    var pTags = ps.map(p => p.tag)
    var pCount = ps.length
  } catch (e) {
    await message.reply(e)
    return
  }
  
  const cards = [
    'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9',
    'g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9',
    'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9',
    'y0', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9',
    'rSkp', 'gSkp', 'bSkp', 'ySkp', 'rSkp', 'gSkp', 'bSkp', 'ySkp',
    'rRev', 'gRev', 'bRev', 'yRev', 'rRev', 'gRev', 'bRev', 'yRev',
    'r2p', 'g2p', 'b2p', 'y2p', 'r2p', 'g2p', 'b2p', 'y2p',
    'wd', 'wd', 'wd', 'wd',
    'wd4p', 'wd4p', 'wd4p', 'wd4p'
  ]
  
  let shuffled = cards
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
  
  let disB = []
  let InB = []
  let pCards = {}
  
  ps.forEach((p, i) => {
    pCards[p.id] = shuffled.slice(7*i, 7*(i+1))
  })
  
  InB = shuffled.slice((ps.length)*7)
  
  delete cards, shuffled
  
  await channel.send(createEmbed({
    head: "Match has started!",
    desc: `Move to your DMs y'all,\n ${pTags.join("\n")}`,
    foot: "Have Fun!"
  }))
  
  let winners = []
  let ended = false
  let disTotal = 0
  let cpi = 0
  
  await (async function firstMove() {
    let disCard = InB.shift()
    disB.unshift(disCard)
    
    disTotal += 1
    
    try {
      await send({
        content: {
          desc: `Starts from **${ps[cpi].username}**`,
          cField: [[`Discard Block (${disTotal})`, disCard]],
          pField: ps.map(p => [p.id, p.username, `:${pCards[p.id].join(": :")}:`])
        },
        ps
      })
    } catch (e) {
      ended = true
      console.error(e)
      await channel.send(e)
      await changeStatus(ps, false)
      return
    }
  })()
  
  while (!ended) {
    let cp = ps[cpi % pCount]
    
    try {
      let msgs = await cp.dmChannel.awaitMessages(m => m.author.id === cp.id, {
        max: 1,
        time: 45000,
        errors: ["time"]
      })
      var msg = msgs.first()
      let txt = msg.content.trim().split(/ +/).join(" ")
      
      if (txt[0] === ":") {
        await send({
          content: `\`${cp.username}\`${txt}`,
          ps,
          exception: [cp.id]
        })
        return
      }
      
      if (["e.uno x", "end", "exit", "cancel"].includes(txt.toLowerCase())) {
        throw "Ended by **" + cp.username + "**"
      }
      
      try {
        let choice = determineCard(content)
        let cpc = pCards[cpi % pCount]
        
        await cp.send(choice + " working")
        cpi += 1
        return
      } catch (e) {
        await cp.send(`Invalid Card Choice. Include \`:\` (colon) as prefix if it was to convey the message to other ps.`)
        return
      }
    } catch (e) {
      ended = true
      console.error(e)
      await channel.send(
        typeof e === "string"
        ? e
        : `${cp.username} went afk. Match Ended`
      )
      await changeStatus(ps, false)
      return
    }
  }
  
  function createEmbed({head, desc, foot, fields}) {
    let embed = new Discord.MessageEmbed()
      .setTitle(head || "UNO Match")
      .setFooter(foot || `Time Elapsed: ${Math.ceil((Date.now() - sTime)/60000)}`)
      .setColor(embedColor)
    
    desc && embed.setDescription(desc)
    
    fields && fields.forEach(f => {
      embed.addField(...f)
    })
    
    return embed
  }
  
  async function send({ content, ps, exception }) {
    if (typeof content !== "string") var { head, desc, foot, cField = [], pField = [] } = content
    
    if (ps.length) {
      for (let p of ps) {
        if (exception?.includes(p.id)) continue
        
        try {
          await p.send(typeof content === "string"
            ? content
            : createEmbed({
              head, desc, foot,
              fields: [...cField, pField.find(f => f[0] === p.id).slice(1)]
            })
          )
        } catch (e) {
          throw `Can't send message to ${p.username}`
        }
      }
    }
  }
}

function determineCard(txt) {
  if (!isNaN(txt)) return parseInt(txt)
  
  let tRex = [
      /skip|skp/,
      /reverse|rev/,
      /p|plus|\+/,
      /(?<!p|plus|\+)[0-9](?!p|plus|\+)/
  ]
  let tNames = ["Skp", "Rev", "2p", ""]
  let tIdx = tRex.findIndex(r => r.test(txt))
  let type = tNames[tIdx] ||
    txt.match(tRex[tIdx])[0] ||
    null
  
  let cTxt = txt.replace(tRex[tIdx], "")
  
  let color = /g|grn|green/.test(cTxt)
    ? "g"
    : /b|blue/.test(cTxt)
    ? "b"
    : /y|ylw|yellow/.test(cTxt)
    ? "y"
    : /w|wd|wild|wildcard/.test(cTxt)
    ? "wd"
    : /r|red/.test(cTxt)
    ? "r"
    : null
  
  if (type === "2p" && color === "wd") type = "4p"
  if (!type || !color) throw "Invalid Input"
  
  return `${color}${type}`
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