const db = require("../schemas/items.js");
const Discord = require("discord.js");

module.exports = async function (message) {
  
  const args = message.content.toLowerCase().trim().split(' ').slice(1);
  
  //Amount (last word)
  let itemAmountArray = args.slice(-1); //returns last word in array
  let itemAmount = parseInt(itemAmountArray[0]); //integer
  
  //Name
  let itemNameArray = args; //Message in []
  let killTheNumber = itemNameArray.pop();
  let itemName = itemNameArray.join(' ');
  console.log(itemName, killTheNumber);
  
  if(!itemAmount || isNaN(itemAmount)) { //Validates Item
    itemAmount = 1;
    itemName = args.join(' '); //Need to remove
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
  
  const itemData = await db.findOne({name: itemName}).catch((e) => console.log(e));
  
  if(!itemData) {
    message.reply("Invalid Item");
    return;
  }
  
  await console.log(itemName, itemAmount);
  
  return [itemName, itemAmount];
};