const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
  pageNumber: { type: Number, required: true },
  text: { type: String, required: true },
  position: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Highlight', highlightSchema);