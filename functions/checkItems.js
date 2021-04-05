const db = require("../schemas/items.js");
const Discord = require("discord.js");
const getErrors = require('./getErrors.js');

module.exports = async function (message) {
  
  const args = message.content.toLowerCase().trim().split(' ').slice(1);
  
  //Amount (last word)
  let itemAmountArray = args[args.length - 1]; //returns last word in string
  let itemAmount = parseInt(itemAmountArray); //integer
  
  //Name
  let itemNameArray = args; //Message in []
  if(itemAmount && parseInt(itemAmount)) {
    itemNameArray.pop(); //Kill the last element
  }
  let itemName = itemNameArray.join('');
  
  if(!itemAmount || isNaN(itemAmount)) { //Validates Item
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
  if(itemName === "lootbox" || itemName === "loot box") {
    itemName = "lootbox";
  }
  
  const itemData = await db.findOne({name: itemName}).catch((e) => console.log(e));
  
  if(!itemData) {
    message.reply(getErrors('item', itemName));
    return 'err';
  }
  
  return [itemName, itemAmount];
};