const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: Number, required: false },
    class: { type: Number, required: false },
    stdId: { type: Number, required: false },
    discordId: { type: String, required: true, unique: true },
    riotNickname: { type: String, required: false },
    verify: { type: Boolean, default: false },
    point: { type: Number, default: 0 },
  },
  { versionKey: false },
);

module.exports = mongoose.model('User', userSchema);
