const mongoose = require('mongoose');

const misc = new mongoose.Schema({
  _id: Number,
  name: String,
  blacklist: Array, //for Blacklisted users
});

const model = mongoose.model('misc', misc);

module.exports = model;