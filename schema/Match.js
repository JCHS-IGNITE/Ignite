const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    team1: { type: mongoose.Schema.Types.ObjectId, required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, required: true },
    round: { type: Number, required: true },
    win: { type: mongoose.Schema.Types.ObjectId, default: null },
    start: { type: Boolean, default: false },
    end: { type: Boolean, default: false },
  },
  { versionKey: false },
);

module.exports = mongoose.model('Match', matchSchema);
