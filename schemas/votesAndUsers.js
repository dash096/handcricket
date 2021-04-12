const mongoose = require('mongoose');

const votesAndUsers = new mongoose.Schema({
  name: { type: String, required: true },
  array: { type: [], default: [] },
});

const model = mongoose.model('votesAndUsers', votesAndUsers);

module.exports = model;