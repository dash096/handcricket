const mongoose = require('mongoose');

const decors = new mongoose.Schema({
  _id: {
    required: true,
    unique: true,
    type: Number,
  },
  name: {
    required: true,
    unique: true,
    type: String,
  },
  type: {
    required: true,
    unique: true,
    type: Number,
  },
  url: {
    required: true,
    unique: true,
    type: String,
  }
});

const model = mongoose.model('decoratives', decors);
module.exports = model;