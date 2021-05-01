const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const embedColor = require('./getEmbedColor.js');
const executeTeamMatch = require('./teamInnings.js');
const chooseToss = require('./chooseToss.js');
const rollToss = require('./rollToss.js');

module.exports = async (message, client) => {
  const { channel, content, author, mentions } = message;
  
  await getReactors();
  
  //Collect reactions from sent Embed and next Choose Caps.
  async function getReactors() {
    const { channel, content, author, mentions } = message;
    const enterEmoji = await getEmoji('enter');
    
    let players = [];
    let playerTags = [];
    
    //Send and React the Embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Join ${author.tag} team match`)
      .setDescription(`React ${enterEmoji} to join`);
    const collectorMessage = await channel.send(embed);
    await collectorMessage.react(enterEmoji);
  
    //Create Collector
    const reactionCollector = await collectorMessage.createReactionCollector(
      reaction => reaction.emoji.name == reaction.emoji.name,
      { time: 30 * 1000 }
    );
    
    //On end, check players.
    await reactionCollector.on('end', async (collectedReactions) => {
      let reactors = [];
      
      collectedReactions.forEach(reactions => {
        reactors = (Array.from(reactions.users.cache.values())).filter(user => user.bot === false);
      });
      
      reactors.forEach(reactor => {
        players.push(reactor);
      });
      players.forEach(player => {
        playerTags.push(player.tag);
      });
      
      if(players.length <= 2) {
        channel.send('TeamMatch aborted due to insufficient members, the members required are minimum 3');
        return;
      } else {
        const check = await checkDataAndStatus(players);
        if(check === 'err') return;
        await changeStatus(players, true);
        await channel.send('TeamMatch started, Players are\n' + playerTags.join('\n'));
        await chooseCaptains(players, playerTags);
      }
    });
    
    async function checkDataAndStatus(players) {
      for(const player in players) {
        const data = await db.findOne({_id: player.id});
        if(!data) {
          channel.send(getErrors({error: 'data', player}));
          return 'err';
        } else if (data.status === true) {
          channel.send(getErrors({error: 'engaged', player}));
          return 'err';
        }
      }
    }
  }
  
  async function chooseCaptains(players, playerTags) {
    //Choose Captain
    let cap1 = players[Math.floor(Math.random() * players.length)];
    let cap2 = players[Math.floor(Math.random() * players.length)];
    if(cap2.id === cap1.id) cap2 = players[players.indexOf(cap2) + 1] || players[players.indexOf(cap2) - 1];
    
    let availablePlayers = players.filter(player => player.id !== cap1.id && player.id !== cap2.id);
    if(availablePlayers.length % 2 === 1) availablePlayers.push('ExtraWicket#0000');
    
    //Send Embed
    const embed = new Discord.MessageEmbed()
      .setTitle('TeamMatch')
      .setDescription('Leaders are asked to pick the members available for your team from\n')
      .addField('Team #1', `Leader: ${cap1.tag}`)
      .addField('Team #2', `Leader: ${cap2.tag}`)
      .addField('Available Players', availablePlayers.join('\n'))
      .setColor(embedColor);
    await channel.send(embed);
    await getTeams(cap1, cap2, players, availablePlayers);
  }
  
  let extraPlayer;
  async function getTeams(cap1, cap2, players, availablePlayers) {
    let team1 = [cap1];
    let team2 = [cap2];
    
    //Nested to captain2 in the function itself
    const chose = await ListenToCaptain1();
    if(chose === 'err') {
      await changeStatus(players, false);
      return;
    }
    
    //Get player tags
    let team1Tags = [];
    let team2Tags = [];
    
    let extraPlayer;
    let i = team1.length + team2.length;
      
    await team1.forEach( async player => {
      i -= 1;
      if (!player.tag) {
        if(team1.length > 2) {
          extraPlayer = await askForTheExtraWicketBatsman(players, team1, channel);
        } else {
          extraPlayer = team1[0];
        }
        await team1Tags.push(`ExtraWicket (${extraPlayer.username})`);
      } else {
        team1Tags.push(player.tag);
      }
        
      if(i === 0) {
        executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel);
      }
    });
      
    await team2.forEach( async player => {
      i -= 1;
      if (!player.tag) {
        if(team2.length > 2) {
          extraPlayer = await askForTheExtraWicketBatsman(players, team2, channel);
        } else {
          extraPlayer = team2[0];
        }
        await team2Tags.push(`ExtraWicket (${extraPlayer.username})`);
      } else {
        team2Tags.push(player.tag);
      }
      
      if(i === 0) {
        executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel);
      }
    });
    
    async function ListenToCaptain1() {
      try {
        if(availablePlayers.length === 1) {
          team2.push(availablePlayers[0]);
          availablePlayers = [];
          return;
        } else if(availablePlayers.length === 0) {
          return;
        } 
        
        channel.send(`${cap1}, choose your member by pinging them`);
        
        const messages = await channel.awaitMessages(
          m => m.author.id === cap1.id, 
          { max: 1, time: 20000, errors: ['time'] }
        );
        const message = messages.first();
        let { content, author, mentions } = message;
        content = content.trim().toLowerCase();
        const pick = mentions.users.first();
      
        if(team1.length > team2.length) {
          return ListenToCaptain1();
        } else if(content.startsWith('extra')) {
          if(availablePlayers.find(player => player == 'ExtraWicket#0000')) {
            availablePlayers.splice(availablePlayers.indexOf('ExtraWicket#0000'), 1);
            team1.push('ExtraWicket#0000');
            return ListenToCaptain2();
          } else {
            channel.send(`${author}, there's no Extra Wicket available`);
            return ListenToCaptain1();
          }
        } else if(content === 'end' || content === 'cancel') {
          channel.send('TeamMatch aborted');
          return 'err'
        } else if(!pick) {
          return ListenToCaptain1();
        } else if(!availablePlayers.find(player => player.id == pick.id)) {
          channel.send(`${author}, ${pick.tag} is not a valid player in the party`);
          return ListenToCaptain1();
        } else {
          team1.push(pick);
          availablePlayers.splice(availablePlayers.indexOf(pick), 1);
          channel.send(`${author}, ${pick.tag} is now in your party`);
          return ListenToCaptain2();
        }
      } catch (e) {
        console.log(e);
        channel.send(`${cap1} ${getErrors({error: 'time'})}`);
        return 'err';
      }
    }
    async function ListenToCaptain2() {
      try {
        if(availablePlayers.length === 1) {
          team2.push(availablePlayers[0]);
          availablePlayers = [];
          return;
        } else if(availablePlayers.length === 0) {
          return;
        }
        
        channel.send(`${cap1}, choose your member by pinging them`);
        
        const messages = await channel.awaitMessages(
          m => m.author.id == cap2.id,
          { max: 1, time: 20000, errors: ['time'] }
        );
        const message = messages.first();
        let { content, author, mentions } = message;
        content = message.content.trim().toLowerCase();
        const pick = mentions.users.first();
      
        if(team1.length <= team2.length) {
          return ListenToCaptain2();
        } else if(content.startsWith('extra')) {
          if(availabePlayers.find(player => player == 'ExtraWicket#0000')) {
            availablePlayers.splice(availablePlayers.indexOf('ExtraWicket#0000'), 1);
            team2.push('ExtraWicket#0000');
            return ListenToCaptain1();
          } else {
            channel.send(`${author}, there's no Extra Wicket available`);
            return ListenToCaptain2();
          }
        } else if(content === 'end' || content === 'cancel') {
          channel.send('TeamMatch aborted');
          return 'err'
        } else if(!pick) {
          return ListenToCaptain2();
        } else if(!availablePlayers.find(player => player.id == pick.id)) {
          channel.send(`${author}, ${pick.tag} is not a valid player in the party`);
          return ListenToCaptain2();
        } else {
          availablePlayers.splice(availablePlayers.indexOf(pick), 1);
          team2.push(pick);
          channel.send(`${author}, ${pick.tag} is now in your party`);
          return ListenToCaptain1();
        }
      } catch (e) {
        console.log(e);
        channel.send(`${cap1} ${getErrors({error: 'time'})}`);
        return 'err';
      }
    }
    
    async function executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel) {
      if(!extraPlayer) return;
      
      let winnerCap = await rollToss(message, team1[0], team2[0]);
      let batTeam;
      let bowlTeam;
      
      if(winnerCap.id === team1[0].id) {
        let toss = await chooseToss(message, team1[0], team2[0]);
        if(chooseToss === 'err') {
          await changeStatus(players, false);
          return;
        }
        if(toss[0].id === team1[0].id) {
          batTeam = team1;
          bowlTeam = team2;
        } else {
          batTeam = team2;
          bowlTeam = team1;
        }
      } else {
        let toss = await chooseToss(message, team2[0], team1[0]);
        if(chooseToss === 'err') {
          await changeStatus(players, false);
          return;
        }
        if(toss[0].id === team1[0].id) {
          batTeam = team1;
          bowlTeam = team2;
        } else {
          batTeam = team2;
          bowlTeam = team1;
        }
      }
      
      let batTags = [];
      let bowlTags = [];
      batTeam.forEach(player => {
        batTags.push(player.tag || 'ExtraWicket#0000')
      });
      bowlTeam.forEach(player => {
        bowlTags.push(player.tag || 'ExtraWicket#0000')
      });
      
      const embed = new Discord.MessageEmbed()
        .setTitle('TeamMatch')
        .setDescription('Leaders are asked to pick the members available for your team from\n')
        .addField('Batting Team', batTags.join('\n'))
        .addField('Bowling Team', bowlTags.join('\n'))
        .setColor(embedColor);
      channel.send(embed);
      
      let batOrder = await pick(batTeam[0], batTeam, 'batsman');
      let bowlOrder = await pick(bowlTeam[0], bowlTeam, 'bowler');
      if(batOrder === 'err' || bowlOrder === 'err') {
        await changeStatus(players, false);
        return;
      }
      
      executeTeamMatch(players, batOrder, bowlOrder, batTeam[0], bowlTeam[0], extraPlayer, channel);
      
      async function pick(cap, team, type) {
        try {
          if(team.length === 2 && team.find(player => typeof player === 'string')) {
            let autoPick = [team[0]];
            autoPick.push('ExtraWicket#0000');
            return autoPick;
          }
          
          if(type === 'batsman') {
            await channel.send(`${cap} ping your batsmen list in order you desire like \`@user1 @user2 @user3\``)
          } else if(type === 'bowler') {
            await channel.send(`${cap} ping your bowlers list in order you desire like \`@user1 @user2 @user3\``)
          }
          
          const messages = await channel.awaitMessages(
            m => m.author.id === cap.id,
            { max: 1, time: 30000, errors: ['time'] }
          );
          const message = messages.first();
          let { content, mentions } = message;
          content = content.trim().toLowerCase();
        
          const picks = Array.from(mentions.users.values()) || [];
          let teamMembers = [];
          
          if(content.includes('extra')) {
            channel.send(`${cap}, extrawickets can only and will be added in the end, u just ping the members`);
            return await pick(cap, team, type);
          } else if(content === 'end' || content === 'cancel') {
            channel.send('TeamMatch aborted');
            return 'err'
          } else if(picks.length === 0) {
            channel.send(`${cap}, ping all the members in the order you desire`);
            return await pick(cap, team, type);
          } else if (picks.length < (team.length - 1)) {
            channel.send(`${cap}, ping all the members in the order you desire`);
            return await pick(cap, team, type);
          } else if (checkAvailablity(picks, team) === false) {
            channel.send(`${cap}, ping all the members **in your team** in the order you desire`);
            return await pick(cap, team, type);
          } else {
            if(team.find(player => typeof player === 'string')) {
              picks.push('ExtraWicket#0000');
              return picks;
            } else {
              if(picks.length < team.length) {
                channel.send(`${cap}, ping all the members in the order you desire`);
                return await pick(cap, team, type);
              }
              return picks;
            }
          };
        } catch (e) {
          console.log(e);
          channel.send(getErrors({error: 'time'}));
          return 'err';
        }
      }
    }
  }
};

function checkAvailablity(picks, team) {
  for(const pick of picks) {
    if(!team.find(player => player.id == pick.id)) {
      return false;
    }
  }
  return true;
}

async function askForTheExtraWicketBatsman(players, team, channel) {
  try {
    const captain = team[0];
    await channel.send(`${captain} you have an extraWicket in your team. Ping a teamMember who is gonna play that extraWicket`);
    const msgs = await channel.awaitMessages(m => m.author.id === captain.id, {
      time: 30000,
      max: 1,
      errors: ['time'],
    });
    const message = msgs.first();
    const content = message.content.trim().toLowerCase();
    const ping = message.mentions.users.first();
    
    if (!ping) {
      channel.send(`${captain} ping a member`);
      return await askForTheExtraWicketBatsman(team, channel);
    } else if(content === 'end' || content === 'cancel') {
      channel.send('TeamMatch aborted');
      return 'err';
    } else if (!team.find(player => player.id === ping.id)) {
      channel.send(`${captain} ping a member who is in your team`);
      return await askForTheExtraWicketBatsman(team, channel);
    } else {
      return ping;
    } 
  } catch (e) {
    console.log(e);
    channel.send(`${cap1} ${getErrors({error: 'time'})}`);
    return 'err';
  }
}

async function changeStatus(a, boolean) {
  if(boolean !== true && boolean !== false) return;
  
  if(Array.isArray(a)) {
    for(const b of a) {
      await db.findOneAndUpdate({_id: b.id}, { $set: {status: boolean}});
    }
  } else {
    await db.findOneAndUpdate({_id: a.id}, { $set: {status: boolean}});
  }
}