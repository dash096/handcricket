const Discord = require('discord.js');
const WOKcomands = require('wokcommands');
const wok = new WOKcommands();

module.exports = {
  name: 'help',
  description: 'Request for help.',
  category: 'general',
  run: async ({
    message
  }) => {
    const commands = wok.commandHandler.commands

    let embed = new Discord.MessageEmbed()
    .setTitle('Help - Request by message.author.username')
    .setDescription('Here is a list of all available commands, Do "!help <command>" for more info')
    .addField('!command <enable/disable> <command>', 'Enables or Disables an command')
    .addField('!requiredRole <Command Name> <"none"/Tagged_Role/"Role_ID">', 'Perm Configuration')

    commands.forEach(command => {
      embed.addField(command.name, command.description, true)
    });

    await message.reply(embed);
  }
}