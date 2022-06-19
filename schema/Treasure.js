const mongoose = require('mongoose');

const treasureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: () => Math.random().toString(36).substring(2, 8), unique: true },
  price: { type: Number, default: 100 },
});

module.exports = mongoose.model('Treasure', treasureSchema);
