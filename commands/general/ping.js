module.exports = {
    name: 'ping',
    description: 'Pong!',
    category: 'General',
    syntax: 'e.ping',
    cooldown: 2,
    run: async ({message}) => {
      const { content, author, channel, mentions } = message;
      const msg = await channel.send('Ponging');
      msg.edit(`${author}, Pong! ${msg.createdTimestamp - message.createdTimestamp}ms`);
    }
};