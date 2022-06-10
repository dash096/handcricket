const db = require("../schemas/player.js")
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
  let inB = []
  let pCards = {}
  
  ps.forEach((p, i) => {
    pCards[p.id] = shuffled.slice(7*i, 7*(i+1))
  })
  
  inB = shuffled.slice((ps.length)*7)
  
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
  let cpip = true //true for ++ false for --
  
  await (async function firstMove() {
    let disCard = inB.shift()
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
  
  communicate()
  function communicate() {
    ps.forEach(p => {
      async function listen(p) {
        try {
          let msgs = await p.dmChannel.awaitMessages(m => m.author.id === p.id && m.content[0] === ":", {
            max: 1,
            time: 60*1000,
            errors: ["time"]
          })
          
          let { content, author } = msgs.first()
          
          await send({
            content: `\`${author.username}:\` ${content.slice(1)}`,
            ps,
            exception: [author.id]
          })
          
          if (!ended) return await listen(p)
        } catch (e) {
          if (!ended) return await listen(p)
        }
      }
      
      listen(p)
    })
  }
  
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
        continue
      } else if (["e.uno x", "end", "exit", "cancel"].includes(txt.toLowerCase())) {
        throw `Match Ended by **${cp.username}**`
      } else if (txt === "+" || /intake|take/.test(txt)) {
        let card = inB.shift()
        
        let disCard = disB[0]
        let cmt
        
        await cp.send(`You took ${deabbreviate(card)}`)
        
        if (
          (card[0] !== disCard[0] && card.slice(1) !== disCard.slice(1)) &&
          (card[0] !== "w" && disCard[0] !== "w")
        ) {
          cpi += cpip ? 1 : -1
          pCards[cp.id].push(card)
          cmt = `**${cp.username}** took one card and it mismatched. Next is **${ps[cpi % pCount].username}**`
        } else {
          disB.unshift(card)
          disTotal += 1
          cmt = "By taking a card," + play(card)
        }
        
        await send({
          content: createEmbed({
            desc: cmt,
            cField: [[`Discard Block (${disTotal})`, disB[0]]],
            pField: ps.map(p => [p.id, p.username, `:${pCards[p.id].join(": :")}:`])
          })
        })
      } else {
        try {
          let choice = determineCard(txt)
          let cpc = pCards[cp.id]
          if (typeof choice === "number") choice = cpc[choice-1]
          
          let cIdx = cpc.findIndex(c => c === choice)
          let card = cpc[cIdx]
          let disCard = disB[0]
          
          //Validations
          if (cIdx === -1) throw "You don't have the card."
          if (
            (card[0] !== disCard[0] && card.slice(1) !== disCard.slice(1)) &&
            (card[0] !== "w" && disCard[0] !== "w")
          ) throw "Color Mismatch, try again."
          
          disB.unshift(card)
          disTotal += 1
          cpc.splice(cIdx, 1)
          pCards[cp.id] = cpc
          
          let cmt = play(card)
          
          await send({
            content: createEmbed({
              desc: cmt,
              cField: [[`Discard Block (${disTotal})`, disB[0]]],
              pField: ps.map(p => [p.id, p.username, `:${pCards[p.id].join(": :")}:`])
            })
          })
        } catch (e) {
          await cp.send(e + ` Include \`:\` (colon) as prefix if it was to convey the message to other players.`)
        }
      }
    } catch (e) {
      ended = true
      console.error(e)
      await channel.send(
        typeof e === "string"
        ? e
        : `**${cp.username}** went afk. Match Ended`
      )
      await changeStatus(ps, false)
      return
    }
    
    function play(card) {
      let cmt
      
      if (card.endsWith("Skp")) {
        cpi += cpip ? 2 : -2
        cmt = `**${cp.username}** used skip, Next is **${ps[cpi % pCount].username}**`
      } else if (card.endsWith("Rev")) {
        cpip = !cpip
        cpi += cpip ? 1 : -1
        cmt = `**${cp.username}** used reverse, Next is **${ps[cpi % pCount].username}**`
      } else if (card.endsWith("2p")) {
        cpi += cpip ? 1 : -1
        
        let p2 = inB.slice(0,2)
        inB = inB.slice(2)
        
        pCards[ps[cpi % pCount].id].push(...p2)
        
        cmt = `**${cp.username}** used +2 card, Next is **${ps[cpi % pCount].username}** who got 2 more cards.`
      } else if (card.startsWith("wd")) {
        cpi = cpip ? 1 : -1
        
        if (card.endsWith("4p")) {
          let p4 = inB.slice(0,4)
          inB = inB.slice(4)
          
          pCards[ps[cpi % pCount].id].push(...p4)
          
          cmt = `**${cp.username}** used +4 wild card, Next is **${ps[cpi % pCount].username}** who got 4 more cards.`
        } else {
          cmt = `**${cp.username}** used a wild card, Next is **${ps[cpi % pCount].username}**`
        }
      } else {
        cpi = cpip ? 1 : -1
        cmt = `**${cp.username}** played his turn, Next is **${ps[cpi % pCount].username}**`
      }
      
      return cmt
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

function deabbreviate(name) {
  let color = name[0]
  color = color === "r"
    ? "red"
    : color === "g"
    ? "green"
    : color === "b"
    ? "blue"
    : color === "y"
    ? "yellow"
    : "wildcard"
  
  let type = color === "wildcard"
    ? name.slice(2)
    : name.slice(1)
  type = (type === "Skp"
    ? "Skip"
    : type === "Rev"
    ? "Reverse"
    : type === "2p"
    ? "Plus Two"
    : type === "4p"
    ? "Plus Four"
    : type) || ""
  
  return color + " " + type
}