const mongoose = require("mongoose");

const player = new mongoose.Schema({
  _id: {
    type: String, required: true
  },
  cc: {
    type: Number, default: 500
  },
  wins: {
    type: Number, default: 0
  },
  loses: {
    type: Number, default: 0
  },
  coinMulti: {
    type: Number, default: 0.2
  },
  tossMulti: {
    type: Number, default: 0.5
  },
  bag: {},
  coinBoost: Date,
  tossBoost: Date,
  level: {
    type: String, default: 'Starter'
  },
  startedOn: {
    type: Date, required: true
  },
  status: {
    type: Boolean, default: false
  },
});

const model = mongoose.model("player", player);

module.exports = model