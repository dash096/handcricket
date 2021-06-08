const mongoose = require('mongoose');

const misc = new mongoose.Schema({
  _id: Number,
  name: String,
  blacklist: Array, //for Blacklisted users
  
  //DecorSale
  price: Number,
  description: String,
  decorName: String,
  messageID: String,
  channelID: String,
  decorTime: Date,
  
});

const model = mongoose.model('misc', misc);

module.exports = model;