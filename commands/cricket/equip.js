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
    
    let decor = 
    decorsData.find(
      decor => decor.toLowerCase() == args.reverse().join('_')
    ) ||
    decorsData.find(
      decor => decor.toLowerCase() == args.reverse().join('_')
    );
    
    let userHasDecor = Object.keys(userDecors).filter(userDecor => userDecor == decor);
    if(!decor || decor == 'equipped') {
      message.reply(`${args.join(' ')} is not a valid decor, it should be like \`e.equip <name_like_how_it_is_in_your_bag>\``);
      return;
    } else if(!userHasDecor || userHasDecor.length === 0) {
      message.reply('You dont own that kek');
      return;
    }
    
    const equipped = userDecors.equipped || [];
    
    if(decor.startsWith('shirt')) {
       let alreadies = equipped.filter(decor => decor.startsWith('shirt') || decor.startsWith('suit'));
       if(alreadies.length > 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('pant') || decor.startsWith('track')) {
       let alreadies = equipped.filter(decor => decor.startsWith('pant') || decor.startsWith('track') || decor.startsWith('suit'));
       if(alreadies.length > 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('foot')) {
       let alreadies = equipped.filter(decor => decor.startsWith('foot'));
       if(alreadies.length > 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('suit')) {
      let alreadies = equipped.filter(decor => decor.startsWith('suit') || decor.startsWith('shirt') || decor.startsWith('pant') || decor.startsWith('track'));
       if(alreadies.length > 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if (decor.startsWith('head')) {
      let alreadies = equipped.filter(decor => decor.startsWith('head'));
      if(alreadies.length === 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
      } else {
        equipped.push(decor);
      }
    } else {
      let already = equipped.filter(decorAdd => decorAdd == decor);
      if(already.length === 0) {
        equipped.push(decor);
      }
    }
    
    userDecors.equipped = equipped;
    await db.findOneAndUpdate({_id: data._id}, {$set: {decors: userDecors}}, {new: true, upsert: true});
    await channel.send('Your character is now wearing ' + args.reverse().join(' '));
  }
};