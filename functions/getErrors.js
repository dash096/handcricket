module.exports = (file, prefix, user) => {
  const errors = {};
  
  errors.syntax = `Incorrect Syntax. Use this syntax: \`${file.syntax}\``;
  errors.data = `**${user.tag}** is not a player, Do \`${prefix}start\``;
  errors.item = `Invalid Item - \`${itemName}\`, Do \`${prefix}shop\` to check it..`;
  
  return errors;
};