const db = require('../../schemas/player.js');
const getDecors = require('../../functions/getDecors.js');
const getErrors = require('../../functions/getErrors.js');

module.exports = {
  name: 'equip',
  aliases: ['wear', 'drop', 'unequip'],
  description: 'Equip your fav decoration',
  syntax: 'e.equip <the_item_name_in_your_bag>',
  category: 'Dogenomy',
  cooldown: 30,
  run: async ({message, client, prefix}) => {
    const { author, content, channel, mentions } = message;
    let type = 'type1';
    const data = await db.findOne({_id: author.id});
    const userDecors = data.decors || {};
    const decorsData = getDecors(type);
    
    const args = content.toLowerCase().trim().split(/ +/);
    
    if(!args || args.length === 0) {
      message.reply(getErrors({error: 'syntax', filePath: 'dogenomy/equip.js'}));
      return;
    }
    
    let command = (args.shift()).slice(prefix.length);
    
    let decor = 
    decorsData.find(
      decor => decor.toLowerCase() == args.join('_')
    ) || 
    decorsData.find(
      decor => decor.toLowerCase() == (args[1] + '_' + args[0])
    ) ||
    decorsData.find(
      decor => decor.toLowerCase() == args[0]
    );
    
    if(!decor && args.join('').includes('suit')) {
      decor = 
      decorsData.find(
        decor => decor.split('_').pop() == args[1]
      ) ||
      decorsData.find(
        decor => decor.split('_').pop() == args[0]
      );
    }
    if(!decor || decor == 'equipped') {
      message.reply(`${args.join(' ')} is not a valid decor, it should be like \`e.equip <name_in_your_bag>\``);
      return;
    }
    
    let userHasDecor = Object.keys(userDecors).filter(userDecor => userDecor == decor);
    let equipped = userDecors.equipped || [];
    if(!userHasDecor || userHasDecor.length === 0) {
      userHasDecor = Object.keys(userDecors).filter(userDecor => userDecor == decor.split('_').reverse().join('_'));
      if(!userHasDecor || userHasDecor.length === 0) {
        message.reply('Do you even own that?');
        return;
      }
    }
    
    if(command == 'drop' || command == 'unequip') {
      equipped.splice(equipped.indexOf(decor), 1);
      await db.findOneAndUpdate({_id: data.id}, {$set: {decors: userDecors}});
      message.reply('You removed ' + args.join(' '));
      return;
    }
    
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
       let alreadies;
       let suitDecor = equipped.find(userDecor => userDecor.startsWith('suit'));
       if(suitDecor && !(suitDecor.slice(4).split('_'))[0].includes('f')) {
         alreadies = equipped.filter(decor => decor.startsWith('foot') || decor.startsWith('suit'));
       } else {
         alreadies = equipped.filter(decor => decor.startsWith('foot'));
       }
       if(alreadies.length > 0) {
         await alreadies.forEach(already => {
           equipped.splice(equipped.indexOf(already), 1);
         });
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if(decor.startsWith('suit')) {
      if(equipped.length > 0) {
         equipped = [];
         equipped.push(decor);
       } else {
         equipped.push(decor);
       }
    } else if (decor.startsWith('head')) {
      let alreadies;
      let suitDecor = equipped.find(userDecor => userDecor.startsWith('suit'));
      if(suitDecor && !(suitDecor.slice(4).split('_'))[0].includes('h')) {
        alreadies = equipped.filter(decor => decor.startsWith('head') || decor.startsWith('suit'));
      } else {
        alreadies = equipped.filter(decor => decor.startsWith('head'));
      }
      if(alreadies.length > 0) {
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
    await message.reply('Your character is now wearing ' + args.reverse().join(' '));
  }
};
