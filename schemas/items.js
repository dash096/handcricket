const mongoose = require('mongoose');

const item = new mongoose.Schema({
  _id: Number,//Cost
  name: String,
  description: String
});

const items = mongoose.model('items', item);

module.exports = items;