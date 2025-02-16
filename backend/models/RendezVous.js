const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // Type de RDV (Diabétologue, Ophtalmologue...)
  date: { type: Date, required: true }, // Date et heure du RDV
  lieu: { type: String, required: true }, // Lieu du RDV
  note: { type: String }, // Remarque facultative
  rappel: { type: Boolean, default: true } // Indique si un rappel est activé
});

module.exports = mongoose.model('RendezVous', RendezVousSchema);
