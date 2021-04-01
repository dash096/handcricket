module.exports = {
    name: 'ping',
    description: 'Pong!',
    category: 'General',
    syntax: 'e.ping',
    cooldown: 2,
    run: (message) => {
        message.reply(`Pong! ${Date.now() - message.createdTimestamp}ms.`);
    }
};