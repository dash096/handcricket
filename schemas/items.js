const mongoose = require('mongoose');

const item = new mongoose.Schema({
  _id: Number,
  name: String,
  price: Number,
  description: String
});

const items = mongoose.model('items', item);

module.exports = items;