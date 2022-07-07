const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    grade: { type: Number, required: true, unique: true },
    class: { type: Number, required: true, unique: true },
    member1: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    member2: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    member3: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    member4: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    member5: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    spareMember: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  },
  { versionKey: false },
);

module.exports = mongoose.model('Team', teamSchema);
