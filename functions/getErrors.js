const getTips = require('./getTips.js');

module.exports = ({error, user, itemName, filePath}) => {
  let tip = getTips();
  
  let prefix = 'e.';
  if(error == 'time') {
    return '🕒 Time\'s up!' + tip;
  } else if( error == 'item') {
    return `Invalid Item - \`${itemName}\`, check it in the shop first..` + tip;
  } else if( error == 'syntax') {
    let file = require(`../commands/${filePath}`);
    return `Incorrect Syntax. Use this syntax: ${
      file.flags || file.subcommands
      ? [
        `\`\`\``,
        `${file.syntax}`,
        file.subcommands
          ? `\nSubcommands\n ${file.subcommands}`
          : `\nFlags\n ${file.flags}`,
        `\`\`\``
      ].join('\n')
      : `\`${file.syntax}\``
    }` + tip;
  } else if( error == 'data') {
    return `**${user.username}** is not a player, Do \`${prefix}start\`` + tip;
  } else if( error == 'lessAssets') {
    return `You dont have that many ${itemName}` + tip;
  } else if( error == 'engaged') {
    return `**${user.username}** is already engaged in another game.` + tip;
  }
  return 'cant get the error, dm and report it to `Dash#7374` or `UltraMoonEagle#3876`';
};