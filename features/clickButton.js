const { MessageButton } = require('discord-buttons');

module.exports = ({ client }) => {
  client.on('clickButton', async (button) => {
    
    if(button.id === 'Reping') {
      const oldMessageTime = Date.now();
      button.message.edit('Ponging Again').then(async message => {
        const newMessageTime = Date.now();
        button.defer();
        button.message.edit(`Pong again! ${newMessageTime - oldMessageTime}ms`);
        return;
      });
    }
    
  });
}