const mongoose = require('mongoose');

const RepasSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String }, 
  description: { type: String, required: true },
  index_glycemique: { type: Number },
  glucides_totaux: { type: Number },
  proteines: { type: Number },
  lipides: { type: Number },
  calories: { type: Number },
  aliments: [{ type: String }],
  date: { type: Date, required: true },
  impact_glycemique: {
    avant_repas: { type: Number },
    apres_repas: { type: Number },
  },
  recommandations: [{ type: String }],
  commentaire: { type: String },
});

module.exports = mongoose.model('Repas', RepasSchema);