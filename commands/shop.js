const Discord = require('discord.js');
const db = require('../schemas/player.js');

const getEmoji = require('../index.js');

module.exports = {
  name: "shop",
  aliases: ["market"],
  category: "handcricket",
  description: 'Displays the items that are for sell in the shop',
  run: async ({
    message
  }) => {
    const emoji = await getEmoji;

    const data = await db.findOne( {
      _id: message.author.id
    }).catch((e) => {
      console.log(e);
    })
    
    if (!data) {
      message.reply(message.author.tag + "You are not a player. Do `!start`");
      return;
    }

    const embed = new Discord.MessageEmbed()
    .setTitle(`Shop Items`)
    .setDescription(`You can buy an item by typing "!buy <name> <amount>", you have a total of ${emoji} ${data.cc}`)
    .addField(`Red Bull ${emoji} 70`, '`Food` Boosts your stamina as high as a bull\'s stamina')
    .addField(`Nuts ${emoji} 50`, '`Food` Strengthens your muscles to hold a bat.')
    .addField(`Toss Boost ${emoji} 750`, '`Boost` Improves your luck when you play handcricket with someone for 1 hour!')
    .addField(`Coin Boost ${emoji} 750`, '`Boost` Improves your gold Multiplier and makes you more richer 1 hour')
    .addField(`Magik Ball ${emoji} 1000 `, '`Powerup` Make the batsman hit only any 1 from the given 2 numbers, 50% wicket possiblity!')
    .addField(`Dots ${emoji} 350`, '`Powerup` Using a stoke during a match, will increase your score by what the bowler has bowled.')
    .addField(`Loot Box ${emoji} 800`, '`Lucky Box` Good Luck to win a rare item')
    .setFooter(`Requested by ${message.author.username}`)
    .setColor('#2d61b5')

    message.reply(embed);
  }
}