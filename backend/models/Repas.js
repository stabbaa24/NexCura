const mongoose = require('mongoose');

const RepasSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String }, 
  nom: { type: String, default: 'Repas sans nom' }, // Ajout du champ nom
  description: { type: String, required: true },
  index_glycemique: { type: Number, default: 0 },
  glucides_totaux: { type: Number, default: 0 },
  proteines: { type: Number, default: 0 },
  lipides: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  fibres: { type: Number, default: 0 },
  aliments: [{ type: String }],
  date: { type: Date, required: true },
  impact_glycemique: {
    avant_repas: { type: Number, default: 0 },
    apres_repas: { type: Number, default: 0 },
  },
  recommandations: [{ type: String }],
  ordre_consommation: [{ type: String }],
  commentaire: { type: String },
});

module.exports = mongoose.model('Repas', RepasSchema);