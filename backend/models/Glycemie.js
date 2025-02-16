const mongoose = require('mongoose');

const GlycemieSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  valeur: { type: Number, required: true },
  unite: { type: String, default: "mg/dL" },
  date: { type: Date, required: true },
  moment_journee: { type: String },
  contexte: { type: String },
  commentaire: { type: String },
});

module.exports = mongoose.model('Glycemie', GlycemieSchema);
