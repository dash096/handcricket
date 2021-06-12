

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
    
    if(!max && c.includes('--ten')) max = true;
    if(!post && c.includes('--post')) post = true;
    
    if(c.startsWith('y')) {
      return [true, post, max];
    }
    else if(c.startsWith('n')){
      msg.reply(`Match aborted`);
      return [false, post, max];
    } else {
      return await checkWill();
    }
    
  } catch(e) {
    message.reply(getErrors({ error: 'time' }));
    console.log(e);
    return [false, post, max];
  }
}