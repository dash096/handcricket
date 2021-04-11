module.exports = {
  name: 'vote',
  aliases: ['v', 'daily', 'claim'],
  description: 'Vote the bot! Support when',
  category: 'general',
  syntax: 'e.vote',
  run: async ({message, topggapi}) => {
    const { content, author, channel, mentions } = message;
    channel.send(`Vote - ${await topggapi.hasVoted(author.id)}`);
  }
};