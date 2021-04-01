module.exports = {
    name: 'ping',
    description: 'Pong!',
    syntax: 'e.ping',
    cooldown: 2,
    run: (message) => {
        message.reply(`Pong! ${Date.now() - message.createdTimestamp}ms.`);
    }
};