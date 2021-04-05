module.exports = (error, user, itemName, filePath) => {
  let prefix = 'e.';
  let errors = {};
  if(error == 'time') {
    errors.time = 'Time\'s up!';
    return errors.time;
  } else if( error == 'item') {
    errors.item = `Invalid Item - \`${itemName}\`, check it in the shop first..`;
    return errors.item;
  } else if( error == 'syntax') {
    let file = require(`../commands/${filePath}`);
    errors.syntax = `Incorrect Syntax. Use this syntax: \`${file.syntax}\``;
    return errors.file;
  } else if( error == 'data') {
    errors.data = `**${user.tag}** is not a player, Do \`${prefix}start\``;
    return errors.data;
  } else if( error == 'lessAssests') {
    errors.asset = `You dont have that many ${item}`;
    return errors.asset;
  }
};