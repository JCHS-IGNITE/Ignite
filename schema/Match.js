const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    team1: { type: mongoose.Schema.Types.ObjectId, required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, required: true },
    round: { type: Number, required: true },
    win: { type: mongoose.Schema.Types.ObjectId, default: null },
    predictionTeam1: { type: Array, default: [] },
    predictionTeam2: { type: Array, default: [] },
    predictionStart: { type: Date, default: null },
    predictionEnd: { type: Date, default: null },
  },
  { versionKey: false },
);

module.exports = mongoose.model('Match', matchSchema);
