const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');
const getEmoji = require('../index.js');
const firstInnings = require("./duoInnings1.js");
const embedColor = require('./getEmbedColor.js');
const executeTeamMatch = require('./teamInnings1.js');

module.exports = async (message) => {
  const { channel, content, author, mentions } = message;
  
  await getReactors();
  
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
        await channel.send('TeamMatch aborted due to insufficient members, the members required are minimum 3');
      } else {
        const check = await checkDataAndStatus(players);
        if(check === 'err') return;
        await channel.send('TeamMatch started, Players are\n' + playerTags.join('\n'));
        await chooseCaptains(players, playerTags);
      }
    });
    
    async function checkDataAndStatus(users) {
      users.forEach(async (user) => {
        const data = await db.findOne({_id: user.id});
        if(!data) {
          let error = 'data';
          channel.send(getErrors({error, user}));
          return 'err';
        } else if(data.status === true) {
          let error = 'engaged';
          channel.send(getErrors({error, user}));
          return 'err';
        }
      });
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
      .setDescription('Leaders are asked to pick the members available for your team from\n' +
        availablePlayers.join(`\n`)
      )
      .addField('Team #1', `Leader: ${cap1.tag}`)
      .addField('Team #2', `Leader: ${cap2.tag}`)
      .setColor(embedColor);
      
    await channel.send(embed);
    await getTeams(cap1, cap2, players, availablePlayers);
  }
  
  async function getTeams(cap1, cap2, players, availablePlayers) {
    await channel.send(`${cap1} choose your team members, just ping them.`);
    
    let team1 = [cap1];
    let team2 = [cap2];
    
    
    //Nested to captain2 in the function itself
    const chose = await ListenToCaptain1();
    if(chose === 'err') return;
    
    //Get player tags
    let team1Tags = [];
    let team2Tags = [];
    await team1.forEach(player => team1Tags.push(player.tag || 'ExtraWicket#0000'));
    await team2.forEach(player => team2Tags.push(player.tag || 'ExtraWicket#0000'));
    
    const embed = new Discord.MessageEmbed()
      .setTitle('Cricket TeamMatch')
      .setDescription('Here is list of members in each team, the first person is the leader who experience more power')
      .addField('Team#1', team1Tags.join('\n'))
      .addField('Team#2', team2Tags.join('\n'))
      .setColor(embedColor);
  
    await channel.send(embed);
    await executeSchedule(team1, team2, team1Tags, team2Tags, channel);
    
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
        let error = 'time';
        channel.send(`${cap1} ${getErrors({error})}`);
        return 'err';
      }
    }
    
    async function executeSchedule(team1, team2, team1Tags, team2Tags, channel) {
      let batTeam;
      let bowlTeam;
      
      let rando = Math.random();
      if(rando < 0.50) {
        batTeam = team2;
        bowlTeam = team1;
      } else {
        batTeam = team1;
        bowlTeam = team2;
      }
      
      await channel.send(`${batTeam[0]} ping your batsmen list in order you desire like \`@user1 @user2 @user3\``)
      let batOrder = await pick(batTeam[0], batTeam, 'batsman');
      if(batOrder == 'err') return;
      await channel.send(`${bowlTeam[0]} ping your bowlers list in order you desire like \`@user1 @user2 @user3\``)
      let bowlOrder = await pick(bowlTeam[0], bowlTeam, 'bowler');
      if(batOrder == 'err') return;
      
      await executeTeamMatch(batOrder, bowlOrder, batTeam[0], bowlTeam[0], channel);
      
      async function pick(cap, team, type) {
        try {
          const messages = await channel.awaitMessages(
            m => m.author.id === cap.id,
            { max: 1, time: 30000, errors: ['time'] }
          );
          const message = messages.first();
          let { content, mentions } = message;
          content = content.trim().toLowerCase();
        
          const picks = Array.from(mentions.users.values()) || [];
          
          if(content.includes('extra')) {
            channel.send(`${cap}, extrawickets can only and will be added in the end, u just ping the members`);
            return await pick(cap, team, type);
          } else if(picks.length === 0) {
            channel.send(`${cap}, ping all the members in the order you desire`);
            return await pick(cap, team, type);
          } else if (picks.length < (team.length - 1)) {
            channel.send(`${cap}, ping all the members in the order you desire`);
            return await pick(cap, team, type);
          } else if (checkAvailablity(picks, team) === false) {
            channel.send(`${cap}, ping all the members in your team in the order you desire`);
            return await pick(cap, team, type);
          } else {
            if(team.find(player => player == 'ExtraWicket#0000')) {
              picks.push('ExtraWicket#0000');
              return picks;
            } else {
              return picks;
            }
          }
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