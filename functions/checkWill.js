const getErrors = require('./getErrors.js');

module.exports =

async function checkWill(channel, target, post, max) {
  try {
    const msgs = await channel.awaitMessages(m => m.author.id === target.id, {
      max: 1,
      time: 30000,
      errors: ['time']
    });
    const msg = msgs.first();
    const c = msg.content.trim().toLowerCase();
    
    if(c.includes('--ten')) max = 10;
    if(c.includes('--post')) post = true;
    
    if(c.startsWith('y')) {
      return [true, post, max];
    }
    else if(c.startsWith('n')){
      msg.reply(`Match aborted`);
      return [false, post, max];
    } else {
      return await checkWill(channel, target, post, max);
    }
    
  } catch(e) {
    channel.send(getErrors({ error: 'time' }));
    console.log(e);
    return [false, post, max];
  }
}