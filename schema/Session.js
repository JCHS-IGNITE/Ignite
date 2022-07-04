const mongoose = require('mongoose');
const { encrypt } = require('../util/aesEncrypto');

const sessionSchema = new mongoose.Schema({
  sessionKey: {
    type: String,
    unique: true,
    default: () => encrypt(Math.random().toString().substring(2)),
  },
  discordId: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Session', sessionSchema);
