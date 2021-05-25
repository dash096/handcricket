const mongoose = require("mongoose");

const player = new mongoose.Schema({
  _id: {
    type: String, required: true
  },
  xp: {
    type: Number, default: 0, required: true
  },
  cc: {
    type: Number, default: 500
  },
  strikeRate: {
    type: Number, default: 0
  },
  wins: {
    type: Number, default: 0
  },
  loses: {
    type: Number, default: 0
  },
  purpleCaps: {
    type: Number, default: 0
  },
  coinMulti: {
    type: Number, default: 0.2
  },
  tossMulti: {
    type: Number, default: 0.5
  },
  bag: {},
  quests: {},
  decors: { type: {}, default: { equipped: [] } },
  coinBoost: Date,
  tossBoost: Date,
  startedOn: {
    type: Date, required: true
  },
  status: {
    type: Boolean, default: false
  },
  voteClaim: {
    type: Boolean, default: false
  },
  voteCooldown: Date,
  voteStreak: Number,
  notifs: {
    type: Boolean, default: true
  }
});

const model = mongoose.model("player", player);

module.exports = model;