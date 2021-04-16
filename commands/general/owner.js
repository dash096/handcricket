module.exports = {
    name: 'owner',
    description: 'see the owner!',
    category: 'General',
    syntax: 'e.owner',
    cooldown: 2,
    run: async ({message, client}) => {
      const { content, author, channel, mentions } = message;
      const user = await client.users.fetch('772368021821718549');
      channel.send('The owner of the bot is ' + user.tag);
    }
};