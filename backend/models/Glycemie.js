const mongoose = require('mongoose');

const GlycemieSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId
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

// Ensure we're using the correct collection name
const Glycemie = mongoose.model('Glycemie', GlycemieSchema, 'glycemie');

module.exports = Glycemie;