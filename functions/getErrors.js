module.exports = (error, user, itemName, filePath) => {
  let prefix = 'e.';
  if(error == 'time') {
    return 'Time\'s up!';
  } else if( error == 'item') {
    return `Invalid Item - \`${itemName}\`, check it in the shop first..`;
  } else if( error == 'syntax') {
    let file = require(`../commands/${filePath}`);
    return `Incorrect Syntax. Use this syntax: \`${file.syntax}\``;
  } else if( error == 'data') {
    return `**${user.tag}** is not a player, Do \`${prefix}start\``;
  } else if( error == 'lessAssests') {
    return `You dont have that many ${itemName}`;
  }
  return 'hmm';
};