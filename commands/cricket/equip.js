const db = require('../../schemas/player.js');
const getDecors = require('../../functions/getDecors.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'equip',
  aliases: ['wear'],
  description: 'Equip your fav decoration',
  syntax: 'e.equip <the_item_name_in_your_bag>',
  category: 'Cricket',
  cooldown: 30,
  run: async ({message, args, client}) => {
    const { author, content, channel, mentions } = message;
    let type = 'type1';
    const data = await db.findOne({_id: author.id});
    const userDecors = data.decors || {};
    const decorsData = getDecors(type);
    
    if(!args || args.length === 0) {
      let error = 'syntax'; let filePath = 'cricket/equip.js';
      message.reply(getErrors({error, filePath}));
      return;
    }
    
    args = args.join(' ').trim().toLowerCase().split(/ +/);
    
    let decor = 
    decorsData.find(decor => decor == args.reverse().join('_')) ||
    decorsData.find(decor => decor == args.join('_'));
    
    let userHasDecor = Object.keys(userDecors).filter(userDecor => userDecor == decor);
    if(!decor || decor.length === 0) {
      message.reply(`${args.reverse().join(' ')} is not a valid decor, it should be like \`e.equip <name_like_how_it_is_in_your_bag>\``);
      return;
    } else if(!userHasDecor || userHasDecor.length === 0 || decor == 'equipped') {
      message.reply('You dont own that kek');
      return;
    }
    
    const equipped = userDecors.equipped || [];
    
    if(decor.startsWith('shirt')) {
       let already = equipped.filter(decor => decor.startsWith('shirt'));
       if(already.length > 0) {
         equipped.splice(equipped.indexOf(already[0]), 1, decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('pant') || decor.startsWith('track')) {
       let already = equipped.filter(decor => decor.startsWith('pant') || decor.startsWith('track'));
       if(already.length > 0) {
         equipped.splice(equipped.indexOf(already[0]), 1, decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('foot')) {
       let already = equipped.filter(decor => decor.startsWith('foot'));
       if(already.length > 0) {
         equipped.splice(equipped.indexOf(already[0]), 1, decor)
       } else {
         equipped.push(decor);
       }
    } else {
      let already = equipped.filter(decorAdd => decorAdd == decor);
      if(already.length === 0) {
        equipped.splice(equipped.indexOf(already[0]), 1, decor);
      } 
    }
    
    userDecors.equipped = equipped;
    await db.findOneAndUpdate({_id: data._id}, {$set: {decors: userDecors}});
    await channel.send('Your character is now wearing ' + args.reverse().join(' '));
  }
}