module.exports = {
  name: 'vote',
  aliases: ['v', 'daily', 'claim'],
  description: 'Vote the bot! Support when',
  category: 'general',
  syntax: 'e.vote',
  run: async (message, args, prefix, client, api) => {
    const { content, author, channel, mentions } = message;
    channel.send(`Vote - ${await api.hasVoted(author.id)}`)
  }
};