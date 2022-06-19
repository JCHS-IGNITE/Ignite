const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  grade: { type: Number, required: true },
  class: { type: Number, required: true },
  stdId: { type: Number, required: true },
  discordId: { type: String, required: true, unique: true },
  point: { type: Number, default: 0 },
  treasures: { type: Array, default: [] },
});

module.exports = mongoose.model('User', userSchema);
