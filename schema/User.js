const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: Number, required: true },
  class: { type: Number, required: true },
  stdId: { type: Number, required: true },
  discordId: { type: String, required: true, unique: true },
  verify: { type: Boolean, default: false },
  point: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
