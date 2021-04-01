const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Get help!',
  category: 'General',
  syntax: 'e.help',
  run: async (message, args, prefix, client) => {
    
    const commands = await getCommands();
    const general = commands[0];
    const cricket = commands[1];
    
    const send = new Discord.MessageEmbed()
      .setTitle('Help')
      .setDescription('Here\'s an Interactive GUIDE for you!\n\n')
      .addField('Navigate via the pages of the guide by typing the number.', 
      '1) 👀 - **__General Conmands__**\n 2) 🏏 - **__Cricket Commands__**')
      .setColor('BLUE')
      .setFooter('Requested by ' + message.author.tag);
    
    const generalEmbed = new Discord.MessageEmbed()
      .setTitle('General Commands')
      .setDescription(general)
      .setColor('BLUE')
      .setFooter('b to go back');
      
    const cricketEmbed = new Discord.MessageEmbed()
      .setTitle('Cricket Commands')
      .setDescription(cricket)
      .setColor('BLUE')
      .setFooter('b to go back');
      
    const embed = await message.channel.send(send);
    
    let goBack = false;
    
    loopHelp();
    async function loopHelp() {
      try {
        const collected = await message.channel.awaitMessages(m => m.author.id === message.author.id,
          { max: 1, time: 30000, errors: ['time'] }
        );
        const msg = collected.first();
        
        if(msg.content == '1') {
          if(goBack == false) {
            embed.edit(generalEmbed);
            goBack = true;
          }
          return loopHelp();
        }
        else if(msg.content == '2') {
          if(goBack == false) {
            embed.edit(cricketEmbed);
            goBack = true;
          }
          return loopHelp();
        }
        else if(msg.content.toLowerCase() == 'b' || msg.content == 'back') {
          if(goBack == true) {
            embed.edit(send);
            goBack = false;
          }
          return loopHelp();
        }
        else {
          return loopHelp();
        }
      } catch(e) {
        console.log(e);
        embed.delete()
        return;
      };
    }
  }
};

function getCommands() {
  let General = '';
  let Cricket = '';
  
  const folders = fs.readdirSync('./commands');
  for(const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`);
    for(const file of files) {
      const command = require(`../${folder}/${file}`);
      if(folder.toLowerCase() == 'cricket') {
        Cricket += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      } else if (folder.toLowerCase() == 'general') {
        General += `**${command.name}** - \`${command.syntax}\`\n ${command.description}\n\n`;
      }
    }
  }
  return [
    General, Cricket
  ];
}