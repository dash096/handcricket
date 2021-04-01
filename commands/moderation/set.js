module.exports = {
  name: 'set',
  description: 'Sets various settings for the guild. Subcommands: prefix, allowOnly (add/remove)',
  syntax: 'e.set <subcommand> <sub-subcommand> <value>',
  run: (message, args, prefix) => {
    message.reply('In development');
  }
}