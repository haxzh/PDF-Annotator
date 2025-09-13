const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('PDF', pdfSchema);