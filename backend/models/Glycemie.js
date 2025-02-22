const mongoose = require('mongoose');

const GlycemieSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  valeur: { 
    type: Number, 
    required: true 
  },
  unite: { 
    type: String, 
    default: "mg/dL" 
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  moment_journee: { 
    type: String 
  },
  contexte: { 
    type: String 
  },
  commentaire: { 
    type: String 
  }
});

// Vérification du nom de la collection - Changement du nom de la collection
const Glycemie = mongoose.model('Glycemie', GlycemieSchema, 'glycemie');

module.exports = Glycemie;