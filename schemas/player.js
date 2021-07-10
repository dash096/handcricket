const mongoose = require("mongoose");

const player = new mongoose.Schema({
  _id: {
    type: String, required: true
  },
  xp: {
    type: Number, default: 0
  },
  stamina: {
    type: Number, default: 10
  },
  cc: {
    type: Number, default: 500
  },
  strikeRate: {
    type: Number, default: 0
  },
  highScore: {
    type: Number, default: 0
  },
  totalScore: {
    type: Number, default: 0
  },
  wickets: {
    type: Number, default: 0
  },
  wins: {
    type: Number, default: 0
  },
  loses: {
    type: Number, default: 0
  },
  orangeCaps: {
    type: Number, default: 0
  },
  coinMulti: {
    type: Number, default: 0.2
  },
  tossMulti: {
    type: Number, default: 0.5
  },
  challengeProgress: String,
  pattern: {
    type: {},
    default: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    }
  },
  bag: {},
  decors: {
    type: {},
    default: {
      equipped: ['tracks_black'],
      tracks_black: 1,
    }
  },
  cards: {
    type: [],
    default: [{
      'team': [],
      'slots': 10
    }],
  },
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
  lastVoted: Date,
});

const model = mongoose.model("player", player);

module.exports = model;