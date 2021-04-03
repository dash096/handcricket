const mongoose = require('mongoose');
const quest = {
  name: {type: String, required: true, unique: true},
  description: {type: String, required: true},
  type: {type: String}
};

const model = mongoose.model('quests', quest);
module.exports = model;