const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    round: { type: Number, required: true },
    team1: { type: mongoose.Schema.Types.ObjectId, required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, required: true },
    win: { type: mongoose.Schema.Types.ObjectId, default: false },
  },
  { versionKey: false },
);

module.exports = mongoose.model('Match', matchSchema);
