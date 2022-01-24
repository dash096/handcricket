const mongoose = require('mongoose')

const card = new mongoose.Schema({
  _id: String,
  name: String,
  fullname: String,
  role: String,
  country: String,
  ipl: String,
  ovr: Number,
  spe: Number,
  tec: Number,
  tim: Number,
  mov: Number,
  acc: Number,
  fie: Number,
})

const model = mongoose.model('cards', card)
module.exports = model