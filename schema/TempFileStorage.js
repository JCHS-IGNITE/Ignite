const mongoose = require('mongoose');

const tempFileStorageSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: false },
    url: { type: String, required: true },
  },
  { versionKey: false },
);

module.exports = mongoose.model('TempFileStorage', tempFileStorageSchema);
