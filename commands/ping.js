module.exports = {
    name: 'ping',
    description: 'Pong!',
    category: 'general',
    run: ({message}) => {
        message.reply('Pong!')
    }
}