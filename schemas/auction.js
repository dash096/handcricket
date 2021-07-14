const mongoose = require('mongoose')

const auction = new mongoose.Schema({
  _id: Number,
  owner: {},
  card: {},
  startBid: Number,
  currentBid: Number,
  currentBidder: {},
  start: Date,
  end: Date,
})

let model = mongoose.model('auctions', auction)
module.exports = model