const getErrors = require('./getErrors.js');

module.exports = async function checkWill(channel, target, post, max, wickets, overs) {
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
    if(c.toLowerCase().includes('--wickets')) {
      wickets = c[(/--wickets/.exec(c)).index + 9];
      if (!wickets || isNaN(wickets)) {
        wickets = 1;
        msg.reply('Invalid Value for Flag Wickets and it is set to 1 as default');
      } else if (wickets > 5) {
        wickets = 5;
        msg.reply('Limited wickets for a duoMatch is 1-5, it is now set to 5');
      }
    }
    if(c.toLowerCase().includes('--overs')) {
      overs = c[(/--overs/.exec(c)).index + 7];
      if (!overs || isNaN(overs)) {
        overs = 5;
        msg.reply('Invalid Value for Flag Overs, it is set to 5 as default.');
      } else if (overs > 5) {
        overs = 5;
        msg.reply('Limited overs for a duoMatch is 1-5, it is now set to 5');
      }
    }
    
    if(c.startsWith('y')) {
      return [true, post, max, wickets || 1, overs || 5];
    }
    else if(c.startsWith('n')){
      msg.reply(`Match aborted`);
      return [false, post, max, wickets || 1, overs || 5];
    } else {
      return await checkWill(channel, target, post, max);
    }
    
  } catch(e) {
    channel.send(getErrors({ error: 'time' }));
    console.log(e);
    return [false, post, max, wickets, overs];
  }
}