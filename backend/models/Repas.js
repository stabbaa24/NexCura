const mongoose = require('mongoose');

const RepasSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String }, 
  description: { type: String, required: true },
  index_glycemique: { type: Number },
  glucides_totaux: { type: Number },
  date: { type: Date, required: true },
  impact_glycemique: {
    avant_repas: { type: Number },
    apres_repas: { type: Number },
  },
  commentaire: { type: String },
});

module.exports = mongoose.model('Repas', RepasSchema);
