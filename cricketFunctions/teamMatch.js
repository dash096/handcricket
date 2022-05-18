const db = require("../schemas/player.js");
const Discord = require("discord.js");
const getErrors = require('../functions/getErrors.js');
const getEmoji = require('../functions/getEmoji.js');
const embedColor = require('../functions/getEmbedColor.js');
const executeTeamMatch = require('./teamInnings.js');
const chooseToss = require('../functions/chooseToss.js');
const rollToss = require('../functions/rollToss.js');

module.exports = async (message, client) => {
  const { channel, content, author, mentions } = message;

  let flags = {
    max: 6,
    oversPerBowler: 2,
  }
  if (content.toLowerCase().includes('--ten')) flags.max = 10
  if (content.toLowerCase().includes('--overs')) {
    let overs = content[(/--overs/.exec(content)).index + 8];
    if (!overs || isNaN(overs)) {
      message.reply('Invalid Value for Flag Overs and it is set to 5 as default.');
    } else if (overs > 5) {
      flags.oversPerBowler = 5;
      message.reply('Limited overs for a duoMatch is 1-5, it is now set to 5');
    } else {
      flags.oversPerBowler = overs;
    }
  }

  await getReactors();

  //Collect reactions from sent Embed and next Choose Caps.
  async function getReactors() {
    const { channel, content, author, mentions } = message;
    const enterEmoji = await getEmoji('enter');

    let players = [];
    let playerTags = [];

    //Send and React the Embed
    const embed = new Discord.MessageEmbed()
      .setTitle(`Join ${author.username} team match`)
      .setDescription(`React ${enterEmoji} to join`)
      .setColor(embedColor);
    const collectorMessage = await message.reply(embed);

    //Create Collector
    const reactionCollector = collectorMessage.createReactionCollector(
      reaction => reaction.emoji.name === 'enter' || reaction.emoji.name === '❌',
      {
        time: 40 * 1000,
        dispose: true,
      }
    );

    await collectorMessage.react(enterEmoji);
    await collectorMessage.react('❌');

    let collectedUsers = [];
    let ended;

    //On Collect, changeStatus
    reactionCollector.on('collect', async (reaction, user) => {
      if (reaction.emoji.name === '❌') {
        if (user.id === author.id) {
          ended = true;
          await message.reply('TeamMatch ended');
          await changeStatus(collectedUsers, false);
          await reactionCollector.stop();
          await collectorMessage.delete();
        }
        return;
      }

      const data = await db.findOne({ _id: user.id });

      if (!data) {
        await channel.send(getErrors({ error: 'data', user }));
        await collectorMessage.reactions.cache.find(
          r => r.emoji.name == enterEmoji.name
        ).users.remove(user.id);
        return;
      } else if (data.status === true) {
        await channel.send(getErrors({ error: 'engaged', user }));
        await collectorMessage.reactions.cache.find(
          r => r.emoji.name == enterEmoji.name
        ).users.remove(user.id);
        return;
      }

      await collectedUsers.push(user);
      await channel.send(`${enterEmoji} **${user.username}** joined the teamMatch!`);
      await changeStatus(user, true);
    });

    //On end, check players.
    reactionCollector.on('end', async (collectedReactions) => {
      if (ended) {
        return;
      }

      let reactors = [];

      await collectedReactions.forEach(reaction => {
        if (reaction.emoji.name === 'enter') {
          reactors = (Array.from(reaction.users.cache.values())).filter(user => user.bot === false);
        }
      });

      await reactors.forEach(reactor => {
        players.push(reactor);
      });

      await players.forEach(player => {
        playerTags.push(player.tag);
      });

      if (players.length <= 2) {
        await changeStatus(collectedUsers, false);
        message.reply('TeamMatch aborted due to insufficient members, the members required are minimum 3');
        return;
      } else {
        await changeStatus(collectedUsers, true);
        await message.reply('TeamMatch started, Players are\n' + playerTags.join('\n'));
        await chooseCaptains(players, playerTags);
      }
    });

    //On remove, chnageStatus
    reactionCollector.on('remove', async (reaction, user) => {
      await channel.send(`**${user.username}** left the teamMatch`);
      await changeStatus(user, false);
    });
  }

  async function chooseCaptains(players, playerTags) {
    //Choose Captain
    let cap1 = players[Math.floor(Math.random() * players.length)];
    let cap2 = players[Math.floor(Math.random() * players.length)];
    if (cap2.id === cap1.id) cap2 = players[players.indexOf(cap2) + 1] || players[players.indexOf(cap2) - 1];

    let availablePlayers = players.filter(player => player.id !== cap1.id && player.id !== cap2.id);
    if (availablePlayers.length % 2 === 1) availablePlayers.push('ExtraWicket#0000');

    //Send Embed
    const embed = new Discord.MessageEmbed()
      .setTitle('TeamMatch')
      .setDescription('Leaders are asked to pick the members available for your team from\n')
      .addField('Team #1', `Leader: ${cap1.tag}`)
      .addField('Team #2', `Leader: ${cap2.tag}`)
      .addField('Available Players', availablePlayers.join('\n'))
      .setColor(embedColor);
    await message.reply(embed);
    await getTeams(cap1, cap2, players, availablePlayers);
  }

  let extraPlayer;
  async function getTeams(cap1, cap2, players, availablePlayers) {
    let team1 = [cap1];
    let team2 = [cap2];

    //Nested to captain2 in the function itself
    channel.send(`${cap1}, Choose your team member, available players are:\n ${availablePlayersUsernames().join(',\n')}`);

    try {
      await ListenToCaptain1();
    } catch (e) {
      await changeStatus(players, false);
      await message.reply(e)
      return;
    }

    //Get player tags
    let team1Tags = [];
    let team2Tags = [];

    let extraPlayer;
    let i = team1.length + team2.length;

    await team1.forEach(async player => {
      if (!player.tag) {
        if (team1.length > 2) {
          await channel.send(`${team1[0]}, you have an extraWicket in your team, whos gonna play with that?`);
          try {
            extraPlayer = await askForTheExtraWicketBatsman(players, team1, channel);
          } catch (e) {
            changeStatus(players, false);
            return
          }
        } else {
          extraPlayer = team1[0];
        }
        await team1Tags.push(`ExtraWicket (${extraPlayer.username})`);
      } else {
        team1Tags.push(player.tag);
      }

      i -= 1;
      if (i === 0) {
        executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel);
      }
    });

    await team2.forEach(async player => {
      if (!player.tag) {
        if (team2.length > 2) {
          channel.send(`${team2[0]}, you have an extraWicket in your team, whos gonna play with that?`);

          try {
            extraPlayer = await askForTheExtraWicketBatsman(players, team2, channel);
          } catch (e) {
            changeStatus(players, false)
            return
          }
        } else {
          extraPlayer = team2[0];
        }
        await team2Tags.push(`ExtraWicket (${extraPlayer.username})`);
      } else {
        team2Tags.push(player.tag);
      }

      i -= 1;
      if (i === 0) {
        executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel);
      }
    });

    async function ListenToCaptain1() {
      try {
        if (availablePlayers.length === 1) {
          team2.push(availablePlayers[0]);
          availablePlayers = [];
          return;
        } else if (availablePlayers.length === 0) {
          return;
        }

        const messages = await channel.awaitMessages(
          m => m.author.id === cap1.id,
          { max: 1, time: 40000, errors: ['time'] }
        );
        const message = messages.first();
        let { content, author, mentions } = message;
        content = content.trim().toLowerCase();
        const pick = mentions.users.first();

        if (team1.length > team2.length) {
          return ListenToCaptain1();
        } else if (content.startsWith('extra')) {
          if (availablePlayers.find(player => player == 'ExtraWicket#0000')) {
            availablePlayers.splice(availablePlayers.indexOf('ExtraWicket#0000'), 1);
            team1.push('ExtraWicket#0000');
            if (availablePlayers.length > 1) channel.send(`${cap2}, Choose your team member, available players are:\n ${availablePlayersUsernames().join(',\n')}`);
            return ListenToCaptain2();
          } else {
            channel.send(`${author}, there's no Extra Wicket available, availableMembers are:\n ${availablePlayersUsernames().join(',\n')}`);
            return ListenToCaptain1();
          }
        } else if (
          content === 'end' ||
          content === 'cancel' ||
          content === 'e.hc x' ||
          content === 'e.hc end'
        ) {
          throw "Match Aborted."
        } else if (!pick) {
          return ListenToCaptain1();
        } else if (!availablePlayers.find(player => player.id == pick.id)) {
          await channel.send(`${author}, ${pick.tag} is not a valid player in the team, availableMembers are:\n ${availablePlayersUsernames().join(',\n')}`);
          return ListenToCaptain1();
        } else {
          team1.push(pick);
          availablePlayers.splice(availablePlayers.indexOf(pick), 1);
          await message.reply(`${author.username}, ${pick.tag} is now in your team`);
          if (availablePlayers.length > 1) channel.send(`${cap2}, Choose your team member, available players are:\n ${availablePlayersUsernames().join(',\n')}`);
          return ListenToCaptain2();
        }
      } catch (e) {
        throw typeof(e) === "string" ? e : getErrors({ error: 'time' })
      }
    }

    async function ListenToCaptain2() {
      try {
        if (availablePlayers.length === 1) {
          team2.push(availablePlayers[0]);
          availablePlayers = [];
          return;
        } else if (availablePlayers.length === 0) {
          return;
        }

        const messages = await channel.awaitMessages(
          m => m.author.id == cap2.id,
          { max: 1, time: 40000, errors: ['time'] }
        );
        const message = messages.first();
        let { content, author, mentions } = message;
        content = message.content.trim().toLowerCase();
        const pick = mentions.users.first();

        if (team1.length <= team2.length) {
          return ListenToCaptain2();
        } else if (content.startsWith('extra')) {
          if (availablePlayers.find(player => player == 'ExtraWicket#0000')) {
            availablePlayers.splice(availablePlayers.indexOf('ExtraWicket#0000'), 1);
            team2.push('ExtraWicket#0000');
            if (availablePlayers.length > 1) channel.send(`${cap1}, Choose your team member, available players are:\n ${availablePlayersUsernames().join(',\n')}`);
            return ListenToCaptain1();
          } else {
            channel.send(`${author}, there's no Extra Wicket available, availableMembers are:\n ${availablePlayersUsernames().join(',\n')}`);
            return ListenToCaptain2();
          }
        } else if (
          content === 'end' ||
          content === 'cancel' ||
          content === 'e.hc x' ||
          content === 'e.hc end'
        ) {
          throw "Match Aborted."
        } else if (!pick) {
          return ListenToCaptain2();
        } else if (!availablePlayers.find(player => player.id == pick.id)) {
          channel.send(`${author}, ${pick.tag} is not a valid player in the team, availableMembers are:\n ${availablePlayersUsernames().join(',\n')}`);
          return ListenToCaptain2();
        } else {
          availablePlayers.splice(availablePlayers.indexOf(pick), 1);
          team2.push(pick);
          message.reply(`${author.username}, ${pick.tag} is now in your team`);
          if (availablePlayers.length > 1) channel.send(`${cap1}, Choose your team member, available players are:\n ${availablePlayersUsernames().join(',\n')}`);
          return ListenToCaptain1();
        }
      } catch (e) {
        throw typeof(e) === "string" ? e : getErrors({ error: 'time' })
      }
    }

    function availablePlayersUsernames(players) {
      if (!players) players = availablePlayers;

      let newArr = [];
      let i = 0;
      while (i < players.length) {
        newArr.push((players[i]).username || players[i]);
        i += 1;
      }
      return newArr;
    }

    async function executeSchedule(players, team1, team2, team1Tags, team2Tags, extraPlayer, channel) {
      let winnerCap = await rollToss(message, team1[0], team2[0], 'cricket');

      let batTeam;
      let bowlTeam;

      let team1Won = winnerCap.id === team1[0].id
      
      try {
        var toss = await chooseToss(
          message,
          team1Won ? team1[0] : team2[0],
          team1Won ? team2[0] : team1[0],
          'cricket',
          players
        );
      
        let team1Bat = toss[0].id === team1[0].id
        batTeam = team1Bat ? team1 : team2;
        bowlTeam = team1Bat ? team2 : team1;
      } catch (e) {
        await changeStatus(players, false);
        await message.reply(e)
        return;
      }

      //Send Embed
      let batTags = []; let bowlTags = [];
      await batTeam.forEach(player => {
        if (player.id === batTeam[0].id) {
          batTags.push(player.tag + ' (captain)');
        } else {
          batTags.push(player.tag || 'ExtraWicket#0000');
        }
      });
      await bowlTeam.forEach(player => {
        if (player.id === bowlTeam[0].id) {
          bowlTags.push(player.tag + ' (captain)');
        } else {
          bowlTags.push(player.tag || 'ExtraWicket#0000');
        }
      });

      const embed = new Discord.MessageEmbed()
        .setTitle('TeamMatch')
        .addField('Batting Team', batTags.join('\n'))
        .addField('Bowling Team', bowlTags.join('\n'))
        .setColor(embedColor);
      await message.reply(embed);

      try {
        if (batTeam.length === 2 && typeof batTeam[1] === 'string') { }
        else await channel.send(`${batTeam[0]} ping your batsmen list in order you desire like \`@user1 @user2 @user3\``)

        let batOrder = await pick(batTeam[0], batTeam, 'batsman');

        if (bowlTeam.length === 2 && typeof bowlTeam[1] === 'string') { }
        else await channel.send(`${bowlTeam[0]} ping your bowlers list in order you desire like \`@user1 @user2 @user3\``);

        var bowlOrder = await pick(bowlTeam[0], bowlTeam, 'bowler');
      } catch (e) {
        await changeStatus(players, false);
        return;
      }

      let teams = ['CSK', 'MI', 'RCB', 'KXIP', 'KKR']
      
      let batTeamNameIdx = Math.floor(Math.random() * teams.length)
      batTeam[0].team = teams[batTeamNameIdx]
      
      teams.splice(batTeamNameIdx, 1)
      
      bowlTeam[0].team = teams[Math.floor(Math.random() * teams.length)]

      executeTeamMatch(client, players, batOrder, bowlOrder, batTeam[0], bowlTeam[0], extraPlayer, message, flags);

      async function pick(cap, team, type) {
        try {
          if (team.length === 2 && team.find(player => typeof player === 'string')) {
            let autoPick = [team[0]];
            autoPick.push('ExtraWicket#0000');
            return autoPick;
          }

          const messages = await channel.awaitMessages(
            m => m.author.id === cap.id,
            { max: 1, time: 60000, errors: ['time'] }
          );
          const message = messages.first();
          let { content, mentions } = message;
          content = content.trim().toLowerCase();

          const picks = Array.from(mentions.users.values()) || [];
          let teamMembers = [];

          if (content.includes('extra')) {
            channel.send(`${cap}, extrawickets can only and will be added in the end, u just ping the members, they are:\n ${availablePlayersUsernames(team).join(',\n')}`);
            return await pick(cap, team, type);
          } else if (
            content === 'end' ||
            content === 'cancel' ||
            content === 'e.hc x' ||
            content === 'e.hc end'
          ) {
            throw "Match Aborted."
          } else if (picks.length === 0) {
            return await pick(cap, team, type);
          } else if (picks.length < (team.length - 1)) {
            channel.send(`${cap}, ping all the members in the order you desire, they are:\n ${availablePlayersUsernames(team).join(',\n')}`);
            return await pick(cap, team, type);
          } else if (checkAvailablity(picks, team) === false) {
            channel.send(`${cap}, ping all the members **in your team** in the order you desire, they are:\n ${availablePlayersUsernames(team).join(',\n')}`);
            return await pick(cap, team, type);
          } else {
            if (picks.length === team.length - 1 && team.find(player => typeof player === 'string')) {
              picks.push('ExtraWicket#0000');
              return picks;
            } else {
              if (picks.length < team.length) {
                channel.send(`${cap}, ping all the members in the order you desire, they are:\n ${availablePlayersUsernames(team).join(',\n')}`);
                return await pick(cap, team, type);
              }
              return picks;
            }
          };
        } catch (e) {
          throw typeof(e) === "string" ? e : getErrors({ error: 'time' })
        }
      }
    }
  }

  function checkAvailablity(picks, team) {
    for (const pick of picks) {
      if (!team.find(player => player.id == pick.id)) {
        return false;
      }
    }
    return true;
  }

  async function askForTheExtraWicketBatsman(players, team, channel) {
    try {
      const captain = team[0];
      const msgs = await channel.awaitMessages(m => m.author.id === captain.id, {
        time: 40000,
        max: 1,
        errors: ['time'],
      });
      const message = msgs.first();
      const content = message.content.trim().toLowerCase();
      const ping = message.mentions.users.first();

      if (!ping) {
        return await askForTheExtraWicketBatsman(players, team, channel);
      } else if (
        content === 'end' ||
        content === 'cancel' ||
        content === 'e.hc x' ||
        content === 'e.hc end'
      ) {
        throw "Match aborted"
      } else if (!team.find(player => player.id === ping.id)) {
        await channel.send(`${captain} ping a member who is in your team`);
        return await askForTheExtraWicketBatsman(players, team, channel);
      } else {
        return ping;
      }
    } catch (e) {
      throw typeof(e) === "string" ? e : getErrors({ error: 'time' })
    }
  }

  async function changeStatus(a, boolean) {
    if (boolean !== true && boolean !== false) return;

    if (Array.isArray(a)) {
      for (const b of a) {
        await db.findOneAndUpdate({ _id: b.id }, { $set: { status: boolean } });
      }
    } else {
      await db.findOneAndUpdate({ _id: a.id }, { $set: { status: boolean } });
    }
  }
};