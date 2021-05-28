const db = require('../../schemas/player.js');
const Discord = require('discord.js');
const embedColor = require('../../functions/getEmbedColor.js');

module.exports = {
  name: 'about',
  aliases: ['info'],
  description: 'Shows info about the bot',
  category: 'General',
  syntax: 'e.about',
  run: async ({message, client}) => {
    let { channel } = message;
    let RAM = Math.round( ((process.memoryUsage().heapUsed) /1024 /1024 * 100) / 100) + ' MB';
    let GUILDS = client.guilds.cache.size;
    let USERS = (await db.find()).length;
    let TIME = parseInt((process.uptime())/60) + ' MINS';
    const embed = new Discord.MessageEmbed()
      .setTitle('About Dispo Cheems')
      .setDescription('Thanks to Aadithya, GRENINJA, General Nix Sh Sandile, Diego, Killua and all other peeps who helped the bot grow and test it out.')
      .addField('Links', '[Add the bot](https://bit.ly/dispoBot)\n[Vote me](https://top.gg/bot/804346878027235398/vote)\n[Support Server](https://bit.ly/dispoGuild)')
      .addField('Stats', `${GUILDS} Guilds\n${USERS} Players`)
      .addField('Process', `Ram Usage: ${RAM}\nUptime: ${TIME}`)
      .addField('Developers', `By Dash#7374 (developer), UltraMoonEagle#3876 (designer) and King Kane#5483 (artist)`)
      .setFooter('Made with 💖 with discord.js', "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt6B6HUVgdNO6fZQYdFl5GvhMPc1B5_LXjjPDpgTZML7DWZvneIJz7tUc&s=10")
      .setColor(embedColor);
    channel.send(embed);
  }
}