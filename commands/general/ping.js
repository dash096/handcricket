module.exports = {
  name: 'ping',
  description: 'Pong!',
  category: 'General',
  syntax: 'e.ping',
  cooldown: 2,
  run: async ({message}) => {
    const { content, author, channel, mentions } = message;
    
    message.reply('Ponging..').then(msg => {
      msg.edit(`🔫 Pong 🔫 ${msg.createdTimestamp - message.createdTimestamp}ms`);
    }).catch(e => {
      console.log(e)
    });
  }
};