const db = require("../schemas/items.js");
const Discord = require("discord.js");

module.exports = async function (message) {
  
  const args = message.content.toLowerCase().trim().slice(1);
  
  let itemAmount = args.slice(-1);
  let itemName = args.pop().join(' ');
  
  if(!itemAmount || isNaN(itemAmount)) {
    itemAmount = 1;
  }
  
  /*redbull, nuts, dot, magikball, coinboost, tossboost, lootbox */
  if(itemName === "red bull" || itemName === "redbull") {
    itemName = "redbull";
  }
  if(itemName === "nuts" || itemName === "nut") {
    itemName = "nuts";
  }
  if(itemName === "dots" || itemName === "dot") {
    itemName = "dots";
  }
  if(itemName === "magik ball" || itemName === "magikball") {
    itemName = "magikball";
  }
  if(itemName === "coin boost" || itemName === "coinboost") {
    itemName = "coinboost";
  }
  if(itemName === "toss boost" || itemName === "tossboost") {
    itemName = "tossboost";
  }
  
  const itemData = db.findOne({name: name}).catch((e) => console.log(e));
  
  if(!data) {
    message.reply("Invalid Item");
    return;
  }
  
  await console.log(args, itemName, itemAmount, itemData);
  
  return [itemName, itemAmount];
};