const mongoose = require('mongoose');

const MedicamentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.Mixed, // Permet d'accepter ObjectId ou String
    required: true,
    index: true
  },
  nom: { 
    type: String, 
    required: true 
  },
  dose: { 
    type: String, // Exemple: "500 mg"
    required: true 
  },
  frequence: { 
    type: String, // Exemple: "2 fois par jour"
    required: true 
  },
  heure_prises: { 
    type: [String], // Tableau contenant les heures sous forme de chaîne (ex: ["08:00", "20:00"])
    required: true 
  },
  type: { 
    type: String, // Exemple: "comprimé", "injection", etc.
    required: true 
  },
  commentaire: { 
    type: String, 
    default: "" 
  },
  rappel_active: { 
    type: Boolean, 
    default: true 
  }
});

// Nom de la collection "medicaments" au lieu de "medicament"
const Medicament = mongoose.model('Medicament', MedicamentSchema, 'medicaments');

module.exports = Medicament;
